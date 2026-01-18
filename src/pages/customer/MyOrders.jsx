import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Clock, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        paid: 'bg-blue-100 text-blue-800 border-blue-200',
        printing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
    };

    const icons = {
        pending: <Clock size={14} />,
        paid: <CheckCircle size={14} />,
        printing: <PrinterIcon size={14} />,
        completed: <CheckCircle size={14} />,
        cancelled: <XCircle size={14} />
    };

    return (
        <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border ${styles[status] || styles.pending}`}>
            {icons[status] || <Clock size={14} />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const PrinterIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
);

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/api/orders/my');
                setOrders(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6 sm:flex sm:items-center sm:justify-between">

                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg hidden sm:block">
                                    <FileText className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {order.shop_name || 'Unknown Shop'}
                                        </h3>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        ID: <span className="font-mono text-gray-700">#{order.id.slice(0, 8)}</span>
                                        <span className="mx-2">•</span>
                                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        Total: <span className="text-gray-900">₹{order.total_amount}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-0 flex items-center justify-end">
                                <Link to={`/checkout/${order.id}`}>
                                    <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg">
                                        View Details <ChevronRight size={16} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No past orders</h3>
                        <p className="text-gray-500 mt-1">Start by finding a shop near you.</p>
                        <Link to="/shops" className="inline-block mt-4 text-blue-600 font-semibold hover:underline">
                            Browse Shops &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
