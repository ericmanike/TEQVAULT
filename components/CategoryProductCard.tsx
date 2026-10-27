"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/lib/products";
import { useWishlist } from "@/components/WishlistContext";
import { cn } from "@/lib/utils";

export interface CategoryProductCardProps {
  /** Optional full product object from lib/products */
  product?: Product;
  /** Product title or name (overrides product.name) */
  title?: string;
  name?: string;
  /** Product price as a number (e.g. 60) or string (overrides product.price) */
  price?: number | string;
  /** Original/old price for showing discount strikethrough */
  oldPrice?: number | string;
  /** Image URL (overrides product.images[0]) */
  image?: string;
  imageUrl?: string;
  /** Destination product slug (links to /products/[slug]) */
  slug?: string;
  /** Destination link URL (if custom href is needed) */
  href?: string;
  /** Category badge or label */
  category?: string;
  /** Optional custom badge (e.g. "SALE", "HOT", "-20%") */
  badge?: string;
  /** Card aspect ratio (default: 'aspect-[3/4]') */
  aspectRatio?: string;
  /** Extra container class names */
  className?: string;
  /** Extra image class names */
  imageClassName?: string;
  /** Whether image should load with priority */
  priority?: boolean;
  /** Whether to show the wishlist heart button (defaults to true if product.id exists) */
  showWishlist?: boolean;
  /** Whether to show discount/out-of-stock badge (default: true) */
  showBadge?: boolean;
  /** Custom click handler */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Helper to format price to Ghanaian Cedis (GH₵ xx.xx) matching screenshot format
 */
function formatCardPrice(val: number | string | undefined): string {
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "number") {
    return `GH₵ ${val.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  const str = String(val).trim();
  if (str.startsWith("GH₵") || str.startsWith("GHS")) {
    return str;
  }
  const numeric = parseFloat(str.replace(/[^0-9.-]+/g, ""));
  if (!isNaN(numeric)) {
    return `GH₵ ${numeric.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `GH₵ ${str}`;
}

export function CategoryProductCard({
  product,
  title,
  name,
  price,
  oldPrice,
  image,
  imageUrl,
  slug,
  href,
  category,
  badge,
  aspectRatio = "aspect-[3/4]",
  className,
  imageClassName,
  priority = false,
  showWishlist = true,
  showBadge = true,
  onClick,
}: CategoryProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const wishlistContext = useWishlist();

  // Resolved values (explicit props take precedence over product object)
  const displayTitle = title || name || product?.name || "Product Name";
  const rawPrice = price !== undefined ? price : product?.price;
  const rawOldPrice = oldPrice !== undefined ? oldPrice : product?.oldPrice;
  const formattedPrice = formatCardPrice(rawPrice);
  const formattedOldPrice = rawOldPrice ? formatCardPrice(rawOldPrice) : null;

  const rawImage =
    image ||
    imageUrl ||
    (product?.images && product.images.length > 0 ? product.images[0] : null);

  const fallbackImage =
    "https://placehold.co/600x800/1e293b/ffffff?text=" +
    encodeURIComponent(displayTitle.slice(0, 16));

  const displayImage = imgError || !rawImage ? fallbackImage : rawImage;

  const targetHref =
    href || (slug ? `/products/${slug}` : product?.slug ? `/products/${product.slug}` : undefined);

  const displayCategory = category || product?.category;

  const productId = product?.id;
  const isSaved = productId && wishlistContext ? wishlistContext.isInWishlist(productId) : false;

  const discountPercent =
    product?.discount != null && product.discount > 0
      ? Math.round(product.discount)
      : rawOldPrice && typeof rawPrice === "number" && typeof rawOldPrice === "number" && rawOldPrice > rawPrice
      ? Math.round(((rawOldPrice - rawPrice) / rawOldPrice) * 100)
      : null;

  const resolvedBadge =
    badge ||
    (product && !product.inStock
      ? "Out of Stock"
      : discountPercent && discountPercent > 0
      ? `-${discountPercent}%`
      : null);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wishlistContext) return;

    if (product) {
      wishlistContext.toggleWishlist(product);
    } else if (productId || displayTitle) {
      const fallbackProd: Product = {
        id: productId || String(displayTitle),
        name: displayTitle,
        slug: slug || "",
        description: "",
        price: typeof rawPrice === "number" ? rawPrice : Number(rawPrice) || 0,
        brand: "",
        category: displayCategory || "",
        images: rawImage ? [rawImage] : [],
        inStock: true,
        stock: 1,
        rating: 5,
        ratingCount: 1,
      };
      wishlistContext.toggleWishlist(fallbackProd);
    }
  };

  const cardInner = (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-[26px] bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer select-none",
        aspectRatio,
        className
      )}
      onClick={onClick}
    >
      {/* Background Product Image */}
      <Image
        src={displayImage}
        alt={displayTitle}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        priority={priority}
        unoptimized
        onError={() => setImgError(true)}
        className={cn(
          "object-cover transition-transform duration-700 ease-out group-hover:scale-105",
          imageClassName
        )}
      />

      {/* Top Badges & Actions */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3.5 sm:p-4 pointer-events-none">
        {/* Left Badge */}
        <div>
          {showBadge && resolvedBadge && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide shadow-md backdrop-blur-md pointer-events-auto",
                resolvedBadge === "Out of Stock"
                  ? "bg-slate-900/90 text-white"
                  : "bg-red-600/95 text-white"
              )}
            >
              {resolvedBadge}
            </span>
          )}
        </div>

        {/* Right Wishlist Button */}
        {showWishlist && productId && (
          <button
            type="button"
            aria-label="Save to wishlist"
            onClick={handleWishlistClick}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isSaved ? "fill-red-500 text-red-500" : "text-white"
              )}
            />
          </button>
        )}
      </div>

      {/* Soft Bottom Gradient Overlay for text contrast without deep darkening */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/50 via-black/20 via-30% to-transparent pointer-events-none" />

      {/* Subtle hover brightness overlay */}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Bottom Content: Title & Price */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 md:p-6 flex flex-col justify-end pointer-events-none">
  

        {/* Product Name / Title */}
        <h3 className="text-white text-base sm:text-lg md:text-xl font-medium leading-snug tracking-normal drop-shadow-sm line-clamp-2 mb-1">
          {displayTitle}
        </h3>

        {/* Price (Large & Bold matching reference) */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-white text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-md leading-none">
            {formattedPrice}
          </span>
          {formattedOldPrice && (
            <span className="text-white/60 text-xs sm:text-sm font-semibold line-through">
              {formattedOldPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Wrap in Link if navigation target exists
  if (targetHref) {
    return (
      <Link href={targetHref} className="block w-full">
        {cardInner}
      </Link>
    );
  }

  return cardInner;
}

// Named alias for convenience
export const OverlayProductCard = CategoryProductCard;
export default CategoryProductCard;
