import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { MapPin, Printer, ArrowRight, Search } from 'lucide-react';

export default function ShopList() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const res = await api.get('/shops/all');
                if (res.data.success) {
                    setShops(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchShops();
    }, []);

    const filteredShops = shops.filter(shop =>
        shop.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 sm:text-5xl">
                    Find a <span className="text-blue-600">Print Shop</span> Near You
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Seamlessly send documents to local shops and pick them up when ready.
                </p>

                {/* Search Bar */}
                <div className="mt-8 max-w-xl mx-auto relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition duration-200 ease-in-out"
                        placeholder="Search by shop name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Shop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredShops.map(shop => (
                    <div key={shop.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
                        {/* Card Header / Gradient Placeholder */}
                        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Printer className="text-white opacity-20 transform scale-150 group-hover:scale-125 transition-transform duration-500" size={64} />
                        </div>

                        <div className="p-6 flex-grow flex flex-col">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {shop.shop_name}
                            </h2>
                            <div className="flex items-start gap-2 text-gray-500 mb-6 flex-grow">
                                <MapPin size={18} className="mt-1 flex-shrink-0 text-blue-400" />
                                <p className="text-sm leading-relaxed">{shop.address}</p>
                            </div>

                            <Link to={`/shop/${shop.id}`} className="mt-auto">
                                <button className="w-full bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md">
                                    Start Printing
                                    <ArrowRight size={18} />
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filteredShops.length === 0 && (
                <div className="text-center py-20">
                    <div className="bg-gray-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                        <Search className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No shops found</h3>
                    <p className="text-gray-500">Try adjusting your search terms.</p>
                </div>
            )}
        </div>
    );
}
