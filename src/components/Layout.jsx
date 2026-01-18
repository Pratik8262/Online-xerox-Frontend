import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import { LogOut, User, Menu, Printer } from 'lucide-react';

export const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavLink = ({ to, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 
                ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
                {children}
            </Link>
        );
    };

    const SideLink = ({ to, icon: Icon, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-2 group relative overflow-hidden
                ${isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                )}
                <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="relative z-10">{children}</span>
            </Link>
        );
    };

    // Shop Layout with Sidebar
    if (user && user.role === 'shop') {
        return (
            <div className="min-h-screen bg-gray-50 flex font-sans">
                {/* Sidebar */}
                <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 fixed h-full z-20 hidden md:flex flex-col shadow-sm">
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Printer className="text-white" size={20} />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Zero<span className="text-blue-600">X</span></span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-6 px-4">
                        <SideLink to="/shop/dashboard" icon={Menu}>Dashboard</SideLink>
                        <SideLink to="/shop/orders" icon={Printer}>Incoming Orders</SideLink>
                        <SideLink to="/shop/pricing" icon={User}>Pricing</SideLink>
                        <SideLink to="/shop/analytics" icon={Printer}>Analytics</SideLink>
                    </div>

                    <div className="p-4 border-t border-gray-100">
                        <div className="mb-4 px-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 w-full text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </aside>

                <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        );
    }

    // Customer / Guest Layout (Top Navbar)
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Glassmorphic Navbar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Printer className="text-white" size={20} />
                            </div>
                            <Link to="/" className="flex-shrink-0 flex items-center text-xl font-bold tracking-tight text-gray-900">
                                Zero<span className="text-blue-600">X</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-6">
                            {user ? (
                                <>
                                    <div className="hidden md:flex items-center space-x-2">
                                        {user.role === 'customer' && (
                                            <>
                                                <NavLink to="/shops">Find Shops</NavLink>
                                                <NavLink to="/orders">My Orders</NavLink>
                                            </>
                                        )}
                                    </div>

                                    <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                                    {/* User Dropdown */}
                                    <div className="relative group">
                                        <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium text-sm focus:outline-none transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                                        </button>

                                        {/* Dropdown Content */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                            >
                                                <User size={16} /> View Profile
                                            </Link>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                            >
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Login</Link>
                                    <Link to="/register">
                                        <Button size="sm" className="shadow-lg shadow-blue-200">Get Started</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow w-full mx-auto">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">© 2024 ZeroX Platform. Made with 💙.</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-blue-600">Privacy</a>
                        <a href="#" className="hover:text-blue-600">Terms</a>
                        <a href="#" className="hover:text-blue-600">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
