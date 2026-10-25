import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teqvault.app';

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) return { title: 'Product Not Found' };

    const pageUrl = `${siteUrl}/products/${product.slug}`;
    const mainImage = product.images?.[0] || `${siteUrl}/favicon.ico`;

    return {
        title: `${product.name} | TEQVAULT`,
        description: product.description,
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: `${product.name} | TEQVAULT`,
            description: product.description,
            url: pageUrl,
            siteName: 'TEQVAULT',
            images: [{ url: mainImage, width: 800, height: 800, alt: product.name }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description,
            images: [mainImage],
        },
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        brand: {
            '@type': 'Brand',
            name: product.brand || 'TEQVAULT',
        },
        offers: {
            '@type': 'Offer',
            url: `${siteUrl}/products/${product.slug}`,
            priceCurrency: 'NGN',
            price: product.price,
            availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
    };

    return (
        <main className="min-h-screen bg-slate-50 w-full overflow-x-hidden pt-4 md:pt-8 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
                <ProductDetailClient product={product} relatedProducts={relatedProducts} />
            </div>
        </main>
    );
}
