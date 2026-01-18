import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/Button';

export default function ShopOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/shop');
            setOrders(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDownload = async (fileKey, fileName) => {
        try {
            // 1. Get Download Token
            const tokenRes = await api.post('/files/token/download', { fileKey });
            const { token, downloadUrl } = tokenRes.data.data;

            // 2. Fetch Blob
            const response = await fetch(downloadUrl, {
                method: 'POST', // Worker uses POST for download
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName; // Worker might return headers, but we set manually
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

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Incoming Orders</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{order.user_name}</div>
                                    <div className="text-sm text-gray-500">{order.user_phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{order.print_type} / {order.paper_size}</div>
                                    <div className="text-sm text-gray-500">{order.total_pages} pages • ₹{order.total_amount}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Button size="sm" variant="outline" onClick={() => navigate(`/shop/order/${order.id}`)}>
                                        View Files
                                    </Button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {order.status === 'paid' && (
                                        <Button
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => handleStatusUpdate(order.id, 'printing')}
                                        >
                                            Start Printing
                                        </Button>
                                    )}
                                    {order.status === 'printing' && (
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleStatusUpdate(order.id, 'completed')}
                                        >
                                            Complete Order
                                        </Button>
                                    )}
                                    {order.status === 'completed' && (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Completed
                                        </span>
                                    )}
                                    {order.status === 'cancelled' && (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                            Cancelled
                                        </span>
                                    )}
                                    {order.status === 'pending' && (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href={`/shop/order/${order.id}`} className="text-blue-600 hover:text-blue-900">Details</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && <div className="p-6 text-center text-gray-500">No orders found</div>}
            </div>
        </div>
    );
}
