import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/Button';

export default function ShopOrderDetail() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/api/orders/${orderId}`);
                setOrder(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleDownload = async (file) => {
        try {
            const tokenRes = await api.post('/api/files/token/download', { fileKey: file.file_key });
            const { token, downloadUrl } = tokenRes.data.data;

            const response = await fetch(downloadUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = file.file_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            alert('Download failed');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Order #{order.id.slice(0, 8)}</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
                <p><span className="font-medium">Name:</span> {order.user_name}</p>
                <p><span className="font-medium">Phone:</span> {order.user_phone}</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Print Specifications</h2>
                <p><span className="font-medium">Type:</span> {order.print_type}</p>
                <p><span className="font-medium">Size:</span> {order.paper_size}</p>
                <p><span className="font-medium">Total Pages:</span> {order.total_pages}</p>
                <p><span className="font-medium">Total Amount:</span> ₹{order.total_amount}</p>
                <p><span className="font-medium">Status:</span> {order.status}</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Files</h2>
                <ul className="divide-y divide-gray-200">
                    {order.files && order.files.map(file => (
                        <li key={file.id} className="py-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{file.file_name}</p>
                                <p className="text-sm text-gray-500">{file.pages} pages</p>
                            </div>
                            <Button size="sm" onClick={() => handleDownload(file)}>Download</Button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
