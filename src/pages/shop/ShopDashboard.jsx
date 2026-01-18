import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import {
    LayoutDashboard,
    ShoppingBag,
    Settings,
    CreditCard,
    TrendingUp,
    Users,
    FileText
} from 'lucide-react';

export default function ShopDashboard() {
    const [stats, setStats] = useState({ total_orders: 0, total_earnings: 0 });
    const [myShop, setMyShop] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, shopRes] = await Promise.all([
                    api.get('/api/payments/shop/stats'),
                    api.get('/api/shops/my/shop').catch(() => ({ data: { data: null } }))
                ]);
                setStats(statsRes.data.data);
                setMyShop(shopRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!myShop) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-indigo-50 p-6 rounded-full mb-6">
                    <LayoutDashboard className="h-16 w-16 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ZeroX Partner 🚀</h1>
                <p className="text-gray-600 max-w-md mb-8">
                    You're one step away from accepting orders. Create your shop profile to get started!
                </p>
                <Button
                    size="lg"
                    className="shadow-xl shadow-indigo-200"
                    onClick={async () => {
                        const name = prompt("Enter Shop Name:");
                        const address = prompt("Enter Address:");
                        if (name && address) {
                            await api.post('/shops', { shop_name: name, address });
                            window.location.reload();
                        }
                    }}>Create Shop Profile</Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{myShop.shop_name}</h1>
                    <p className="text-gray-500 mt-1">Dashboard Overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wide">
                        ● Online
                    </span>
                    <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Earnings Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard size={80} className="text-indigo-600" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-gray-900">₹{stats.total_earnings.toLocaleString()}</span>
                            <span className="text-green-500 text-sm font-medium flex items-center bg-green-50 px-2 py-0.5 rounded-full">
                                <TrendingUp size={12} className="mr-1" /> +12%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag size={80} className="text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Orders</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-gray-900">{stats.total_orders}</span>
                            <span className="text-gray-400 text-sm">lifetime</span>
                        </div>
                    </div>
                </div>

                {/* Customers (Placeholders for now) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} className="text-purple-600" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Customers</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-gray-900">--</span>
                            <span className="text-gray-400 text-sm">coming soon</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to="/shop/orders" className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200">
                    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                        <FileText className="text-blue-600 group-hover:text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Manage Orders</h3>
                    <p className="text-sm text-gray-500 mt-1">View and process incoming files.</p>
                </Link>

                <Link to="/shop/pricing" className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200">
                    <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                        <Settings className="text-indigo-600 group-hover:text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Configure Pricing</h3>
                    <p className="text-sm text-gray-500 mt-1">Set print rates and paper types.</p>
                </Link>
            </div>
        </div>
    );
}
