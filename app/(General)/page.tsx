'use client';
import { ProductCard } from '@/components/ProductCard';
import AutoScrollProductRow from '@/components/AutoScrollProductRow';
import ProductScrollRow from '@/components/ProductScrollRow';
import Link from "next/link";
import HeroSlider from '@/components/HeroSlider';

import Image from 'next/image';

import { fetchAllProducts, Product } from '@/lib/products';
import { useEffect, useState } from 'react';
import { MonitorCog, Cable, ArrowRight, PackageX, Search } from 'lucide-react';
import SkeletonCards from '@/components/SkeletonCards';
import { CategoryRowsSection } from '@/components/CategoryRowsSection';

const COMPUTER_SLIDES = [
  {
    id: 0,
    title: 'TEQVAULT Official Grand Launch!',
    description: 'Watch the official launch commercial. Celebrate with 10% off storewide using code LAUNCH10.',
    ctaText: 'Watch Launch Video',
    ctaLink: '/launch',
    backgroundImage: '/launch_ad_hero.jpg',
  },
  {
    id: 4,
    title: 'Partner With Us',
    description: 'Grow your business on TEQVAULT. Reach thousands of buyers with 0% commission options.',
    ctaText: 'Contact Us',
    ctaLink: '/contact',
    backgroundImage: '/Seller.jpg',
  },
  {
    id: 1,
    title: 'High-Performance Workstations',
    description: 'Powerful setups for creators, developers,gamers and power users.',
    ctaText: 'Shop Workstations',
    ctaLink: '/shop?category=computers',
    backgroundImage: '/officeSet.jpg',
  },
  {
    id: 2,
    title: 'iPhone & Latest Smartphones',
    description: 'Discover the newest flagship iPhones and smartphones with cutting-edge mobile tech.',
    ctaText: 'Explore Smartphones',
    ctaLink: '/shop?category=smartphones',
    backgroundImage: '/cat_smartphones.png',
  },
  {
    id: 3,
    title: 'IT & Networking Devices',
    description: 'Reliable networking hardware and server infrastructure for your business.',
    ctaText: 'Discover More',
    ctaLink: '/shop?category=wifi-network-devices',
    backgroundImage: '/router.jpg',
  },
 
];



export default function Home() {
  const [ALL_PRODUCTS, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAllProducts().then((products) => {
      setAllProducts(products);
      setLoading(false);
    });
  }, []);

  // Basic slice partitioning for demo since ID is now dynamic from DB
  const SPONSORED_GADGETS = ALL_PRODUCTS.slice(0, 6);
  // const LATEST_GADGETS = ALL_PRODUCTS.length > 6 ? ALL_PRODUCTS.slice(6, 10) : ALL_PRODUCTS.slice(0, 4);
  // const RECOMMENDED_GADGETS = ALL_PRODUCTS.length > 10 ? ALL_PRODUCTS.slice(10, 16) : ALL_PRODUCTS.slice(0, 6);

  return (
    <main className="w-full bg-slate-50 min-h-screen   overflow-x-hidden">

  
      <div className="relative  z-10 px-4 md:px-10 space-y-10">
        
        {/* Shop by Category - Carousel */}
        <section className="w-full py-3 md:p-6 rounded-[15px] md:rounded-[15px] bg-transparent shadow-lg shadow-slate-100/50 border border-slate-50 flex flex-col gap-4">
          {/* Section Header Text */}
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight uppercase">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Explore our curated selection of high-quality electronics and tech accessories.
            </p>
          </div>

          {/* Single Row Horizontal Scrollable Category Cards */}
          <div className="flex gap-3  md:justify-center sm:gap-4 overflow-x-auto no-scrollbar py-1 select-none" style={{ WebkitOverflowScrolling: 'touch' }}>
            {[
              { title: 'Computers', url: '/L1.jpg', query: 'computers' },
              { title: 'Smartphones', url: '/cat_smartphones.png', query: 'smartphones' },
              { title: 'Tablets & Ipads', url: '/cat_tablets.png', query: 'tablets-ipads' },
              { title: 'Accessories', url: '/cat_accessories.png', query: 'accessories' },
              { title: 'Printers & Scanners', url: '/cat_printers.png', query: 'printers-scanners' },
              { title: 'Network Devices', url: '/starlink.png', query: 'wifi-network-devices' },
            ].map((cat, idx) => (
              <Link
                key={idx}
                href={`/shop?category=${cat.query}`}
                className="group flex flex-col gap-2 shrink-0 w-[110px] sm:w-[130px] md:w-[150px] select-none"
              >
                {/* Image Container */}
                <div className="relative h-[80px] sm:h-[95px] md:h-[110px] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100 w-full">
                  <Image
                    src={cat.url}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 130px, 150px"
                    priority={true}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {/* Label under card */}
                <span className="text-[10px] sm:text-xs font-bold text-slate-800 tracking-wide text-center group-hover:text-orange-500 transition-colors leading-tight truncate px-0.5">
                  {cat.title.toUpperCase()}
                </span>
              </Link>
            ))}
            <a
              href="https://www.megagigs.net/buy"
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col gap-2 shrink-0 w-[110px] sm:w-[130px] md:w-[150px] select-none"
            >
              <div className="relative h-[80px] sm:h-[95px] md:h-[110px] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100 w-full">
                <Image
                  src="/mtn-router.png"
                  alt="Data Bundle"
                  fill
                  sizes="(max-width: 640px) 110px, (max-width: 768px) 130px, 150px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-center text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-orange-500 transition-colors">
                Data Bundle
              </span>
            </a>
          </div>

            {/* View All Button */}
            <div className="col-span-full flex justify-center mt-4 md:mt-6">
              <Link
                href="/shop"
                className="
                group/btn relative inline-flex items-center justify-center gap-3.5 
                px-8 md:px-10 py-3.5 md:py-4  
                bg-orange-500 hover:bg-orange-600
                text-white rounded-full
                font-black text-sm md:text-base uppercase tracking-wider
                transition-all duration-300 shadow-lg shadow-orange-500/25
                hover:shadow-xl hover:shadow-orange-500/35
                hover:scale-[1.02] active:scale-[0.98]
                cursor-pointer select-none "
                
              >
                <span className="font-black tracking-widest"> Start Shopping!. </span>

                <ArrowRight className="relative z-10 w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

        </section>

        {/* Sponsored Gadgets - Carousel */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-2xl font-black text-slate-900 flex items-center gap-2 md:gap-3 uppercase">
            Top Selling
            </h2>
            {!loading && SPONSORED_GADGETS.length > 0 && (
              <Link href="/shop" className="text-orange-500 font-bold text-base flex items-center hover:translate-x-1 transition-transform group whitespace-nowrap">
                View All <svg className="w-4 h-4 md:w-5 md:h-5 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}
          </div>
          {loading ? (
            <SkeletonCards cols={4} rows={1} />
          ) : SPONSORED_GADGETS.length > 0 ? (
            <AutoScrollProductRow products={SPONSORED_GADGETS} />
          ) : (
            <div className="w-full py-12 px-4 rounded-2xl bg-white shadow-lg flex flex-col items-center justify-center text-center my-2">
              <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
                <Search className="w-7 h-7 stroke-[1.75]" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-800">No products found</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
                There are currently no new arrival products available. Check back soon!
              </p>
            </div>
          )}
        </section>

        {/* Category Rows: Each category title with its respective products */}
        <CategoryRowsSection products={ALL_PRODUCTS} loading={loading} />

      </div>

      {/* Non-straight Wave / Curved Top Border */}
      <div className="w-full overflow-hidden leading-none pointer-events-none -mb-1 mt-6">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-20 md:h-28 block"
        >
          {/* Subtle accent depth wave */}
          <path
            d="M0,70 C360,10 600,100 900,40 C1140,0 1320,60 1440,40 L1440,120 L0,120 Z"
            fill="#7b4bf7"
            fillOpacity="0.4"
          />
          {/* Main solid wave matching section background */}
          <path
            d="M0,45 C280,105 520,15 760,65 C1000,115 1240,30 1440,65 L1440,120 L0,120 Z"
            fill="#632cf5"
          />
        </svg>
      </div>

      <section className="relative overflow-hidden bg-[#632cf5] text-white py-16 lg:py-24">

        <div className="relative mx-auto w-[80%] px-2 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (Text & Button) */}
          <div className="lg:col-span-5 flex flex-col justify-center items-start">
            <h2 className="text-4xl font-extrabold sm:text-5xl md:text-8xl tracking-tight leading-[1.15] text-white">
              Shop the Best Tech. <br /> 
           
            </h2>
            <p className="mt-4 text-lg text-purple-100/90 max-w-md">
              Discover top brand  with discount.
            </p>
            <div className="mt-8">
              
              <Link
                href="/shop"
                className="inline-block rounded-full bg-[#E0E7FF] text-[#4F46E5] px-8 py-3.5 text-2xl font-bold transition-all duration-200 hover:bg-white hover:scale-[1.03] active:scale-[0.98] shadow-md hover:shadow-lg"
              >
              Browse All
              </Link>
            </div>
          </div>
            
          {/* Right Column: Virtual Reality Experience Image */}
          <div className="lg:col-span-7 w-full lg:justify-self-end">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl shadow-indigo-900/40 group hover:scale-[1.01] transition-transform duration-500">
              <Image
                src="/vr.jpg"
                alt="Virtual Reality Tech Experience"
                width={800}
                height={450}
                className="w-full h-auto object-cover rounded-3xl transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none rounded-3xl" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
