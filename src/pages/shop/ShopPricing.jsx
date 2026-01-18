import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function ShopPricing() {
    const [pricing, setPricing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        print_type: 'BW',
        paper_size: 'A4',
        price_per_page: ''
    });

    const fetchPricing = async () => {
        try {
            const res = await api.get('/pricing/my/pricing');
            setPricing(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPricing();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pricing', formData);
            fetchPricing(); // Refresh
            setFormData({ ...formData, price_per_page: '' });
        } catch (err) {
            alert("Failed to add pricing");
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/pricing/${id}`);
            fetchPricing();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Pricing</h1>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-lg font-semibold mb-4">Add New Pricing</h2>
                <form onSubmit={handleAdd} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            className="w-full border rounded-md p-2"
                            value={formData.print_type}
                            onChange={(e) => setFormData({ ...formData, print_type: e.target.value })}
                        >
                            <option value="BW">Black & White</option>
                            <option value="COLOR">Color</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                        <select
                            className="w-full border rounded-md p-2"
                            value={formData.paper_size}
                            onChange={(e) => setFormData({ ...formData, paper_size: e.target.value })}
                        >
                            <option value="A4">A4</option>
                            <option value="A3">A3</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <Input
                            label="Price per Page"
                            type="number"
                            step="0.01"
                            required
                            value={formData.price_per_page}
                            onChange={(e) => setFormData({ ...formData, price_per_page: e.target.value })}
                        />
                    </div>
                    <Button type="submit">Add</Button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pricing.map(p => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{p.print_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{p.paper_size}</td>
                                <td className="px-6 py-4 whitespace-nowrap">₹{p.price_per_page}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pricing.length === 0 && <div className="p-6 text-center text-gray-500">No pricing configured</div>}
            </div>
        </div>
    );
}
