import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { Trash2, Upload, FileText, Plus, Minus, Copy, Monitor, Smartphone, Repeat } from 'lucide-react';

// Toggle Component
const ToggleOption = ({ label, options, value, onChange, icon: Icon }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
            {Icon && <Icon size={12} />} {label}
        </label>
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${value === opt.value
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export default function ShopDetail() {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [pricing, setPricing] = useState([]);
    const [loading, setLoading] = useState(true);

    // Multi-File Upload State
    // Format: { file: FileObject, id: uniqueId, pages: 1, config: { print_type, paper_size, copies, sides } }
    const [files, setFiles] = useState([]);

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shopRes, priceRes] = await Promise.all([
                    api.get(`/api/shops/${shopId}`),
                    api.get(`/api/pricing/shop/${shopId}`)
                ]);
                setShop(shopRes.data.data);
                setPricing(priceRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [shopId]);

    const calculateTotal = () => {
        return files.reduce((acc, file) => {
            // Find price for this file's config
            const priceObj = pricing.find(p =>
                p.print_type === file.config.print_type &&
                p.paper_size === file.config.paper_size
            );
            const rate = priceObj ? parseFloat(priceObj.price_per_page) : 0;
            // Multiplier for double sided? Assuming same price per page (2 pages = 2x price)
            // Ideally backend handles sides pricing, but for now we treat sides='double' as just rendering preference.
            // Page count should be exact logic: if 10 pages double sided -> still 10 pages printed (5 sheets). 
            // Usually 'price per page' implies per printed side. So rate * pages is correct.

            return acc + (rate * (file.pages || 1) * file.config.copies);
        }, 0);
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(f => ({
                file: f,
                id: Math.random().toString(36).substr(2, 9),
                pages: 1, // Default, logic to count pages would go here or updates later
                config: {
                    print_type: 'BW',
                    paper_size: 'A4',
                    copies: 1,
                    sides: 'single'
                }
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    // Update specific config for a file
    const updateFileConfig = (id, key, value) => {
        setFiles(prev => prev.map(f => {
            if (f.id === id) {
                // If update is top-level like 'pages'
                if (key === 'pages') return { ...f, pages: parseInt(value) || 1 };
                // Else update config
                return { ...f, config: { ...f.config, [key]: value } };
            }
            return f;
        }));
    };

    const handleIncrementCopies = (id, delta) => {
        setFiles(prev => prev.map(f => {
            if (f.id === id) {
                const newCopies = Math.max(1, f.config.copies + delta);
                return { ...f, config: { ...f.config, copies: newCopies } };
            }
            return f;
        }));
    };

    const handleOrder = async () => {
        if (files.length === 0) {
            setError("Please select at least one file");
            return;
        }

        // Validate pricing availability
        const infoMissing = files.some(f =>
            !pricing.find(p => p.print_type === f.config.print_type && p.paper_size === f.config.paper_size)
        );

        if (infoMissing) {
            setError("Some file configurations do not have matching pricing from the shop.");
            return;
        }

        setUploading(true);
        setError('');

        try {
            // 1. Get Upload Token (Reuse for all files)
            const tokenRes = await api.post('/api/files/token/upload');
            const { token, uploadUrl } = tokenRes.data.data;

            // 2. Upload All Files in Parallel
            const uploadPromises = files.map(async (fileItem) => {
                const formData = new FormData();
                formData.append('file', fileItem.file);

                const workerRes = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (!workerRes.ok) throw new Error(`Upload failed for ${fileItem.file.name}`);

                const workerData = await workerRes.json();
                return {
                    key: workerData.key,
                    name: fileItem.file.name,
                    pages: fileItem.pages,
                    // Pass specific config to backend
                    print_type: fileItem.config.print_type,
                    paper_size: fileItem.config.paper_size,
                    copies: fileItem.config.copies,
                    sides: fileItem.config.sides
                };
            });

            const uploadedFiles = await Promise.all(uploadPromises);

            // 3. Create Order
            // Calculate aggregations for Order Header (legacy/summary purpose)
            // We can pick majority or just default for header, since details are in files.
            // Let's use first file's config or mixed.
            const totalAmount = calculateTotal();
            const totalPages = files.reduce((acc, f) => acc + (f.pages * f.config.copies), 0);

            const orderPayload = {
                shop_id: shopId,
                // These header fields might be less relevant now, but keeping schema happy
                print_type: 'BW', // Default/Placeholder
                paper_size: 'A4',
                price_per_page: 0, // Calculated per file
                total_pages: totalPages,
                total_amount: totalAmount,
                file_keys: uploadedFiles // Contains per-file details
            };

            const orderRes = await api.post('/api/orders', orderPayload);
            const orderId = orderRes.data.data.id;

            // 4. Redirect
            navigate(`/checkout/${orderId}`);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Something went wrong during upload/order');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-blue-600">Loading Shop...</div>;
    if (!shop) return <div className="text-center mt-10 text-red-500">Shop not found</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white shadow-lg">
                <h1 className="text-3xl font-extrabold mb-2">{shop.shop_name}</h1>
                <p className="text-blue-100 flex items-center gap-2">
                    <span className="opacity-80">📍</span> {shop.address}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Files & Settings */}
                <div className="lg:col-span-2 space-y-6">

                    {/* File Upload Header */}
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            📂 Select Documents
                        </h2>
                        <label className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 text-sm">
                            <Plus size={16} /> Add Files
                            <input type="file" multiple onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>

                    {files.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400 bg-gray-50">
                            <Upload size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No files selected</p>
                            <p className="text-sm mt-1">Click "Add Files" to start your order</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {files.map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md">

                                    {/* Row 1: Info & Actions */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="bg-blue-50 p-3 rounded-lg flex-shrink-0">
                                                <FileText className="text-blue-500" size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-800 truncate" title={item.file.name}>
                                                    {item.file.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {(item.file.size / 1024 / 1024).toFixed(2)} MB • PDF
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {/* Copies Counter */}
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Copies</span>
                                                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                                    <button
                                                        onClick={() => handleIncrementCopies(item.id, -1)}
                                                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-semibold text-gray-700">{item.config.copies}</span>
                                                    <button
                                                        onClick={() => handleIncrementCopies(item.id, 1)}
                                                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Delete */}
                                            <button
                                                onClick={() => handleRemoveFile(item.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <hr className="border-gray-100 mb-4" />

                                    {/* Row 2: Toggles */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <ToggleOption
                                            label="Color Mode"
                                            // icon={Monitor}
                                            options={[
                                                { label: 'B&W', value: 'BW' },
                                                { label: 'Color', value: 'COLOR' }
                                            ]}
                                            value={item.config.print_type}
                                            onChange={(val) => updateFileConfig(item.id, 'print_type', val)}
                                        />

                                        <ToggleOption
                                            label="Paper Size"
                                            // icon={Expand}
                                            options={[
                                                { label: 'A4', value: 'A4' },
                                                { label: 'A3', value: 'A3' }
                                            ]}
                                            value={item.config.paper_size}
                                            onChange={(val) => updateFileConfig(item.id, 'paper_size', val)}
                                        />

                                        <ToggleOption
                                            label="Sides"
                                            // icon={Repeat}
                                            options={[
                                                { label: 'Single', value: 'single' },
                                                { label: 'Double', value: 'double' }
                                            ]}
                                            value={item.config.sides}
                                            onChange={(val) => updateFileConfig(item.id, 'sides', val)}
                                        />
                                    </div>

                                    {/* Pages Input (Optional per file if needed, keeping simple for now) */}
                                    <div className="mt-4 flex justify-end">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>Pages in file:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.pages}
                                                onChange={(e) => updateFileConfig(item.id, 'pages', e.target.value)}
                                                className="w-12 border border-gray-200 rounded p-1 text-center text-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Summary & Pricing */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Order Summary</h2>

                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                            <div className="flex justify-between">
                                <span>Total Files</span>
                                <span>{files.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Pages (Approx)</span>
                                <span>{files.reduce((acc, f) => acc + (f.pages || 1) * f.config.copies, 0)}</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-300 pt-4 mb-6">
                            <div className="flex justify-between items-end">
                                <span className="text-gray-600 font-medium">Estimated Total</span>
                                <span className="text-3xl font-extrabold text-blue-600">₹{calculateTotal()}</span>
                            </div>
                            <p className="text-xs text-right text-gray-400 mt-1">Final price may depend on actual pages</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 flex items-start gap-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            className="w-full py-4 text-lg shadow-blue-200 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold"
                            disabled={uploading || files.length === 0}
                            onClick={handleOrder}
                        >
                            {uploading ? 'Processing Order...' : 'Proceed to Checkout →'}
                        </Button>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">Shop Rate Card</h3>
                            <div className="space-y-2">
                                {pricing.length > 0 ? pricing.map(p => (
                                    <div key={p.id} className="flex justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                        <span>{p.print_type} • {p.paper_size}</span>
                                        <span className="font-semibold text-gray-700">₹{p.price_per_page}/pg</span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-gray-400">No rates available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
