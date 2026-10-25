'use client';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchAllProducts, Product } from '@/lib/products';
import AutoScrollProductRow from '@/components/AutoScrollProductRow';

export default function Footer() {
    const pathname = usePathname();
    const hideFooter = pathname === '/checkout';
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetchAllProducts().then((data) => setProducts(data.slice(0, 10)));
    }, []);

    if (hideFooter) {
        return null;
    } 
    
    return (
        <footer className="bg-slate-900 text-gray-300 border-t border-slate-800 z-0 font-sans">
        

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Brand Section */}
                    <div className="space-y-4 lg:col-span-2">
                        <h3 className="text-3xl font-black text-white tracking-tighter font-outfit">TEQVAULT</h3>
                        <p className="text-base leading-relaxed text-gray-400 max-w-md">
                            Your trusted platform for authentic smartphones, laptops, tech accessories, device trade-ins, flexible financing, and professional IT repair services.
                        </p>
                        <div className="flex gap-5 pt-2">
                            <a href="#" className="text-orange-500 hover:text-white transition-colors"><Facebook className="h-6 w-6" /></a>
                            <a href="#" className="text-orange-500 hover:text-white transition-colors"><Twitter className="h-6 w-6" /></a>
                            <a href="#" className="text-orange-500 hover:text-white transition-colors"><Instagram className="h-6 w-6" /></a>
                            <a href="#" className="text-orange-500 hover:text-white transition-colors"><Linkedin className="h-6 w-6" /></a>
                            <a href="mailto:support@teqvault.app" className="text-orange-500 hover:text-white transition-colors"><Mail className="h-6 w-6" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white uppercase tracking-wider">Company</h4>
                        <ul className="space-y-3 text-base">
                            <li><Link href="/" className="hover:text-orange-500 transition-colors">Home</Link></li>
                            <li><Link href="/about" className="hover:text-orange-500 transition-colors font-semibold text-white">About Us</Link></li>
                            <li><Link href="/shop" className="hover:text-orange-500 transition-colors">Shop Products</Link></li>
                            <li><Link href="/seller" className="hover:text-orange-500 transition-colors">Start Selling</Link></li>
                            <li><Link href="/reviews" className="hover:text-orange-500 transition-colors font-semibold ">Customer Reviews</Link></li>
                        </ul>
                    </div>

                    {/* Support & Legal Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white uppercase tracking-wider">Support</h4>
                        <ul className="space-y-3 text-base">
                            <li><Link href="/faq" className="hover:text-orange-500 transition-colors">FAQ's</Link></li>
                            <li><Link href="/contact" className="hover:text-orange-500 transition-colors">Contact Support</Link></li>
                            <li><Link href="/terms" className="hover:text-orange-500 transition-colors font-semibold text-gray-200">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-orange-500 transition-colors font-semibold text-gray-200">Privacy Policy</Link></li>
                            <li><Link href="/refund-policy" className="hover:text-orange-500 transition-colors font-semibold text-gray-200">Refund & Return Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white uppercase tracking-wider">Contact Us</h4>
                        <ul className="space-y-3.5 text-base">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-1" />
                                <span>Ghana</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-orange-500 shrink-0" />
                                <span>054 344 2518</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-orange-500 shrink-0" />
                                <span>support@teqvault.app</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-4">
                    <p>&copy; {new Date().getFullYear()} TEQVAULT. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

