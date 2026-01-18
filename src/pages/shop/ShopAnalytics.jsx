import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

export default function ShopAnalytics() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        todayRevenue: 0,
        dailyData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/api/orders/shop');
                const orders = res.data.data;

                let total = 0;
                let today = 0;
                const dailyMap = {};
                const todayStr = new Date().toISOString().split('T')[0];

                orders.forEach(order => {
                    if (order.status === 'cancelled') return;

                    const amount = parseFloat(order.total_amount);
                    total += amount;

                    const date = new Date(order.created_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                    });
                    const isoDate = new Date(order.created_at).toISOString().split('T')[0];

                    if (isoDate === todayStr) {
                        today += amount;
                    }

                    if (!dailyMap[date]) {
                        dailyMap[date] = { date, revenue: 0, orders: 0 };
                    }
                    dailyMap[date].revenue += amount;
                    dailyMap[date].orders += 1;
                });

                const dailyData = Object.values(dailyMap).sort((a, b) => new Date(b.date) - new Date(a.date));

                setStats({ totalRevenue: total, todayRevenue: today, dailyData });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-500 mt-2">Track your revenue and order performance in real-time.</p>
            </header>

            {/* Summary Cards with Gradients */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-green-100 transform transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <IndianRupee size={24} className="text-white" />
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">Lifetime</span>
                    </div>
                    <div>
                        <p className="text-green-100 text-sm font-medium mb-1">Total Revenue</p>
                        <h2 className="text-4xl font-bold">₹{stats.totalRevenue.toLocaleString()}</h2>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 transform transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <TrendingUp size={24} className="text-white" />
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">Today</span>
                    </div>
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">Today's Revenue</p>
                        <h2 className="text-4xl font-bold">₹{stats.todayRevenue.toLocaleString()}</h2>
                    </div>
                </div>

                {/* Placeholder Card for future stats */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <ArrowUpRight size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-semibold">Growth Insights</h3>
                    <p className="text-gray-500 text-sm mt-1">More metrics coming soon</p>
                </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                            <Calendar size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Daily Revenue Breakdown</h2>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Value</th>
                                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats.dailyData.length > 0 ? (
                                stats.dailyData.map((day, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-medium text-gray-900">{day.date}</td>
                                        <td className="px-8 py-5 text-sm text-gray-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {day.orders} orders
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-gray-500">
                                            ₹{(day.revenue / day.orders).toFixed(0)}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="text-sm font-bold text-gray-900">₹{day.revenue.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-medium">
                                        No sales data available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
