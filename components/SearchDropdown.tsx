'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { Product, fetchTrendingProducts } from '@/lib/products';
import { formatCurrency } from '@/lib/utils';

interface SearchDropdownProps {
    query: string;
    results: Product[];
    isOpen: boolean;
    onClose: () => void;
    onClear: () => void;
    trendingProducts?: Product[];
}

export default function SearchDropdown({
    query,
    results,
    isOpen,
    onClose,
    onClear,
    trendingProducts: propTrending,
}: SearchDropdownProps) {
    const [trending, setTrending] = useState<Product[]>(propTrending || []);
    const [loadingTrending, setLoadingTrending] = useState(!propTrending || propTrending.length === 0);

    useEffect(() => {
        if (propTrending && propTrending.length > 0) {
            setTrending(propTrending);
            setLoadingTrending(false);
            return;
        }

        let isMounted = true;
        fetchTrendingProducts(6).then((prods) => {
            if (isMounted) {
                setTrending(prods);
                setLoadingTrending(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [propTrending]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="search-dropdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 right-0 top-full bg-white rounded-b-3xl shadow-2xl border border-gray-200 border-t-0 z-50 overflow-hidden"
            >
                {/* No query – show trending products with most orders */}
                {!query && (
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                <TrendingUp size={13} className="text-orange-500" /> Trending Products
                            </p>
                            <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                Most Ordered
                            </span>
                        </div>

                        {loadingTrending ? (
                            <div className="space-y-2 py-2">
                                <div className="flex flex-wrap gap-2">
                                    <div className="h-7 w-24 bg-gray-100 rounded-full animate-pulse" />
                                    <div className="h-7 w-32 bg-gray-100 rounded-full animate-pulse" />
                                    <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
                                </div>
                            </div>
                        ) : trending.length === 0 ? (
                            <p className="text-xs text-gray-400 py-3">No trending products available yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {/* Quick Pill Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {trending.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.slug}`}
                                            onClick={onClose}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent transition-all flex items-center gap-1.5 group/pill active:scale-95"
                                        >
                                            <TrendingUp size={11} className="text-orange-500 group-hover/pill:scale-110 transition-transform" />
                                            <span className="truncate max-w-[200px]">{product.name}</span>
                                        </Link>
                                    ))}
                                </div>

                                {/* Compact Top Ordered List */}
                                <div className="border-t border-gray-100 pt-2.5">
                                    <ul className="divide-y divide-gray-50">
                                        {trending.slice(0, 4).map((product) => (
                                            <li key={product.id}>
                                                <Link
                                                    href={`/products/${product.slug}`}
                                                    onClick={onClose}
                                                    className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 capitalize">{product.category}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-xs font-black text-gray-900">
                                                            {formatCurrency(product.price)}
                                                        </p>
                                                        {product.oldPrice && (
                                                            <p className="text-[10px] text-gray-400 line-through">
                                                                {formatCurrency(product.oldPrice)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Has query – show results */}
                {query && (
                    <>
                        {results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
                                <Search size={32} strokeWidth={1.5} />
                                <p className="text-sm font-semibold">No results for &ldquo;{query}&rdquo;</p>
                                <p className="text-xs">Try a different keyword</p>
                            </div>
                        ) : (
                            <ul className="py-2 max-h-80 overflow-y-auto divide-y divide-gray-50">
                                {results.slice(0, 6).map((product) => (
                                    <li key={product.id}>
                                        <Link
                                            href={`/products/${product.slug}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#f0f0f0] transition-colors group"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                                                    {product.brand}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500">{product.category}</p>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-black text-gray-900">
                                                    {formatCurrency(product.price)}
                                                </p>
                                                {product.oldPrice && (
                                                    <p className="text-[10px] text-gray-400 line-through">
                                                        {formatCurrency(product.oldPrice)}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Footer – view all */}
                        {results.length > 0 && (
                            <div className="border-t border-gray-100 px-4 py-3">
                                <Link
                                    href={`/shop?search=${encodeURIComponent(query)}`}
                                    onClick={onClose}
                                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
                                >
                                    <Search size={13} />
                                    See all results for &ldquo;{query}&rdquo;
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
