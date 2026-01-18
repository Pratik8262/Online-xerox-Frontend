import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, FileText, CreditCard, LogOut, Mail, Phone, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalFiles: 0, totalSpent: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/orders/my');
                const orders = res.data.data;

                const totalSpent = orders.reduce((acc, order) => acc + parseFloat(order.total_amount), 0);
                const totalOrders = orders.length;

                setStats({ totalFiles: totalOrders, totalSpent });

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200 overflow-hidden border border-gray-100">
                {/* Header Profile Section */}
                <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 px-8 py-16 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                    <div className="relative z-10">
                        <div className="mx-auto w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-5xl font-bold mb-6 border-4 border-white/30 text-white shadow-2xl">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{user.name}</h1>

                        <div className="flex justify-center gap-6 mt-4 text-blue-100">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <Mail size={16} />
                                <span className="text-sm font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <Phone size={16} />
                                <span className="text-sm font-medium">{user.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="p-8 md:p-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-800">Your Activity Overview</h2>
                        <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Since Joining</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {/* Files/Orders Stat */}
                        <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShoppingBag size={120} className="text-blue-600" />
                            </div>

                            <div className="flex items-center gap-5 relative z-10">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <ShoppingBag size={32} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
                                    {loading ? (
                                        <div className="h-10 w-20 bg-gray-100 animate-pulse rounded"></div>
                                    ) : (
                                        <p className="text-4xl font-bold text-gray-900">{stats.totalFiles}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Money Spent Stat */}
                        <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-green-200 shadow-sm hover:shadow-xl hover:shadow-green-50 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <CreditCard size={120} className="text-green-600" />
                            </div>

                            <div className="flex items-center gap-5 relative z-10">
                                <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                    <CreditCard size={32} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Spent</p>
                                    {loading ? (
                                        <div className="h-10 w-32 bg-gray-100 animate-pulse rounded"></div>
                                    ) : (
                                        <p className="text-4xl font-bold text-gray-900">₹{stats.totalSpent.toFixed(2)}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8 flex justify-end">
                        <Button
                            variant="outline"
                            className="px-8 py-3 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} className="mr-2" /> Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
