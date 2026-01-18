import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export const PaymentSuccessModal = ({ isOpen, onClose }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setAnimate(true), 100);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div
                className={`relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all duration-500 ease-out border border-white/20
                ${animate ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}
            >
                <div className="flex justify-center mb-6">
                    <div className={`rounded-full bg-green-100 p-4 transition-transform duration-700 delay-100 ${animate ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`}>
                        <CheckCircle size={48} className="text-green-600" strokeWidth={2.5} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-500 mb-8">
                    Your order has been placed successfully. We have sent the confirmation to your email.
                </p>

                <Button
                    onClick={onClose}
                    className="w-full py-3 shadow-lg shadow-green-100 bg-green-600 hover:bg-green-700 active:scale-95 transition-all"
                >
                    View Order Status <ArrowRight size={18} className="ml-2" />
                </Button>
            </div>
        </div>
    );
};
