'use client';
import { Menu, ShoppingBag, ShoppingCart, Truck, Headset, Search, Zap, Home, Wallet, MessageCircleMore, Headphones } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import NotificationsPanel from './Notifications';
import Sidebar from './Sidebar';
import ActiveLink from './ActiveLink';
import DropdownProfile from './Profiledropdown';
import { useRouter } from 'next/navigation';
import Marquee from './marquee';
import { Suspense } from 'react';
import SearchDropdown from './SearchDropdown';
import { fetchAllProducts, Product } from '@/lib/products';
import { useCart } from '@/components/CartContext';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  const router = useRouter();

  // Load products on mount
  useEffect(() => {
    fetchAllProducts().then(setAllProducts);
  }, []);

  // Filter products on query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = allProducts.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
  }, [searchQuery, allProducts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>

      <nav className={`w-full bg-gray-200 shadow-md  top-0 left-0 z-50 transition-transform duration-600 `}>
        <Marquee />

        {/* Top Row: Menu, Logo, Search, and Actions */}
        <div className="flex items-center justify-between px-4 py-2.5 md:py-3.5 gap-x-4 flex-wrap md:flex-nowrap">
          {/* Menu & Logo */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} className="text-black" strokeWidth={2} />
            </button>
            <Link href="/" className="flex items-center gap-2 md:gap-2.5 group cursor-pointer select-none">

              <span className="text-2xl font-extrabold text-gray-800 logo">TEQVAULT</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="w-full order-last py-4 md:py-0 mt-1 md:mt-0 md:order-none md:flex-1 md:w-auto max-w-2xl px-0 md:px-2">
            <div className="relative" ref={searchRef}>
              <form
                onSubmit={handleSearchSubmit}
                className={`flex w-full bg-white transition-all duration-200 overflow-hidden ${
                  isSearchOpen
                    ? 'rounded-t-3xl shadow-2xl border border-gray-200'
                    : 'rounded-full shadow-sm hover:shadow-md border border-gray-200 focus-within:border-orange-500/60'
                }`}
              >
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="I am looking for.."
                    className="no-border w-full h-[48px] md:h-12 pl-5 md:pl-6 pr-11 md:pr-12 bg-transparent outline-none placeholder:text-gray-400 text-slate-800 text-[15px] md:text-base rounded-full focus:outline-none focus:ring-0"
                  />
                  <div className="absolute right-3.5 md:right-4 flex items-center">
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => { setSearchQuery(''); setSearchResults([]); setIsSearchOpen(false); }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer rounded-full hover:bg-gray-100"
                        aria-label="Clear search"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer rounded-full hover:bg-orange-50"
                        aria-label="Search"
                      >
                        <Search size={19} strokeWidth={2.2} />
                      </button>
                    )}
                  </div>
                </div>
                {/* Hidden submit button to guarantee Enter key submits even when search icon is hidden */}
                <button type="submit" className="hidden" aria-hidden="true" />
              </form>

              {/* Search Dropdown */}
              <SearchDropdown
                query={searchQuery}
                results={searchResults}
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onClear={() => { setSearchQuery(''); setSearchResults([]); }}
              />
            </div>
          </div>

          {/* Right Section: Inbox, Cart, Profile (Auth) */}
          <div className="flex justify-between  items-center gap-5 sm:gap-6 md:gap-8 shrink-0">
            <Link
              href="/customer/inbox"
              className="p-2 hover:bg-gray-100 rounded-lg transition text-slate-800 flex items-center justify-center cursor-pointer"
              title="Inbox Messages"
            >
              <MessageCircleMore size={23} className="md:size-[26px]" strokeWidth={2} />
            </Link>

            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition flex items-center justify-center">
              <ShoppingCart size={22} className="text-black md:size-[26px]" strokeWidth={2} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 md:w-4 md:h-4 bg-orange-500 text-white text-[8px] md:text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <DropdownProfile />
          </div>
        </div>

        {/* Bottom Row: Navigation Links */}
        <div className="hidden md:block bg-white border-t border-gray-300 px-4 py-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-center gap-6 md:gap-10 min-w-max mx-auto">
            <ActiveLink href="/">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group">
                <Home size={18} className="group-hover:text-orange-500" />
                <span className="text-sm font-semibold whitespace-nowrap">Home</span>
              </div>
            </ActiveLink>

            <ActiveLink href="/shop">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group">
                <ShoppingBag size={18} className="group-hover:text-orange-500" />
                <span className="text-sm font-semibold whitespace-nowrap">Shop now</span>
              </div>
            </ActiveLink>

            <ActiveLink href="/contact">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group">
                <Headphones size={18} className="group-hover:text-orange-500" />
                <span className="text-sm font-semibold whitespace-nowrap">Contact</span>
              </div>
            </ActiveLink>

            <ActiveLink href="/shop?category=new-arrivals">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group">
                <Truck size={18} className="group-hover:text-orange-500" />
                <span className="text-sm font-semibold whitespace-nowrap"> New Arrivals</span>
              </div>
            </ActiveLink>

            <ActiveLink href="/shop?deals=true">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group whitespace-nowrap">
                <Zap size={18} className="group-hover:text-orange-500 text-orange-500 fill-orange-500/20" />
                <span className="text-sm font-semibold">Falaa Deals</span>
              </div>
            </ActiveLink>

            <ActiveLink href="/customer/pay-small-small">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group whitespace-nowrap">
                <Wallet size={18} className="group-hover:text-orange-500" />
                <span className="text-sm font-semibold">Pay Small Small</span>
              </div>
            </ActiveLink>
          </div>
        </div>
      </nav>

      {/* Floating AI Chatbot / Notification Button */}
      <button
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#632CF5] hover:bg-[#5223cb] text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all active:scale-95 cursor-pointer flex items-center justify-center border-2 border-white shadow-[#632CF5]/40"
        onClick={() => setIsNotificationsOpen(true)}
        aria-label="AI Support & Notifications"
      >
        <Headset size={30} className="text-white" strokeWidth={2.4} />
        <span className="absolute top-0 right-0 mt-0.5 mr-0.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
      </button>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Suspense fallback={null}>
        <NotificationsPanel isOpen={isNotificationsOpen} setIsOpen={setIsNotificationsOpen} />
      </Suspense>
    </>
  );
};

export default Navbar;