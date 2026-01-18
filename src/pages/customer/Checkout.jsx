import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { PaymentSuccessModal } from '../../components/PaymentSuccessModal';
import { CheckCircle, Clock, ArrowLeft, FileText, Download } from 'lucide-react';

export default function Checkout() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    const handlePayment = async () => {
        try {
            const payRes = await api.post('/api/payments', { orderId });
            const { amount, rzp_order_id, rzp_key } = payRes.data.data;

            const options = {
                key: rzp_key,
                amount: amount * 100,
                currency: "INR",
                name: "ZeroX Printing",
                description: `Order #${orderId}`,
                order_id: rzp_order_id,
                handler: async function (response) {
                    try {
                        await api.post('/api/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        // Show success modal instead of alert
                        setShowSuccessModal(true);
                        // navigate('/orders'); // Navigation handled by modal close
                    } catch (e) {
                        alert('Verification failed');
                    }
                },
                prefill: {
                    name: order.user_name,
                    contact: order.user_phone
                },
                theme: { color: "#2563EB" }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (err) {
            console.error(err);
            alert('Payment initiation failed');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-blue-600">Loading Order...</div>;
    if (!order) return <div className="text-center mt-10 text-red-500">Order not found</div>;

    const isPaid = order.status !== 'pending' && order.status !== 'cancelled';
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/orders')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
            >
                <ArrowLeft size={18} /> Back to Orders
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* ... existing content ... */}
                {/* Status Header */}
                <div className={`p-6 text-white ${isPaid ? 'bg-green-600' : isCancelled ? 'bg-red-500' : 'bg-blue-600'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        {isPaid ? <CheckCircle size={28} /> : <Clock size={28} />}
                        <h1 className="text-2xl font-bold">
                            {isPaid ? 'Order Paid' : isCancelled ? 'Order Cancelled' : 'Payment Pending'}
                        </h1>
                    </div>
                    <p className="opacity-90">Order ID: #{order.id.slice(0, 8)}</p>
                </div>

                <div className="p-8">
                    {/* ... details ... */}
                    {/* Order Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Shop Name</p>
                            <p className="font-semibold text-gray-800">{order.shop_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Date</p>
                            <p className="font-semibold text-gray-800">
                                {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Files List - Using flattened files array from backend join if available, or just generic summary */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Files</h3>
                        {order.files && order.files.length > 0 ? (
                            <div className="space-y-3">
                                {order.files.map(file => (
                                    <div key={file.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-blue-500" size={20} />
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{file.file_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {file.pages} pgs • {file.print_type || 'BW'} • {file.paper_size || 'A4'} • {file.copies} copies
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 text-sm">
                                {order.total_pages} Pages ({order.print_type}) - Details unavailable
                            </div>
                        )}
                    </div>

                    {/* Bill Summary */}
                    <div className="border-t border-dashed border-gray-200 pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Total Amount Paid</span>
                            <span className="text-3xl font-bold text-gray-900">₹{order.total_amount}</span>
                        </div>
                        {isPaid && (
                            <p className="text-xs text-green-600 font-medium text-right flex items-center justify-end gap-1">
                                <CheckCircle size={12} /> Payment Verified via Razorpay
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8">
                        {!isPaid && !isCancelled ? (
                            <Button className="w-full py-4 text-lg shadow-blue-200 shadow-xl" onClick={handlePayment}>
                                Pay Now
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full" onClick={() => navigate('/orders')}>
                                View All Orders
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <PaymentSuccessModal
                isOpen={showSuccessModal}
                onClose={() => navigate('/orders')}
            />
        </div>
    );
}
