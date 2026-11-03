import { supabase } from './supabase';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discount?: number;
    oldPrice?: number;
    brand: string;
    category: string;
    categorySlug?: string;
    images: string[];
    inStock: boolean;
    stock: number;
    rating: number;
    ratingCount: number;
    specifications?: { label: string; value: string }[];
    features?: string[];
    aiRecommendation?: string;
    createdAt?: string;
}

export interface DBCategory {
    id: string | number;
    name: string;
    slug: string;
}

export async function fetchCategories(): Promise<DBCategory[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('id');

    if (error || !data) {
        console.error("Error fetching categories:", error?.message || error);
        return [];
    }
    return data;
}

export async function fetchAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select(`
            id, name, brand, price, discount, stock, over_view, created_at,
            categories(id, name, slug),
            product_images(image_url),
            reviews(rating)
        `);

    if (error || !data) {
        console.error("Error fetching products:", error?.message || error || "No data returned");
        return [];
    }

    return data.map(mapDBProductToClient);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
    const parts = slug.split('-');
    const id = parts[parts.length - 1];

    if (id) {
        const { data, error } = await supabase
            .from('products')
            .select(`
                id, name, brand, price, discount, stock, over_view, created_at,
                categories(id, name, slug),
                product_images(image_url),
                reviews(rating)
            `)
            .eq('id', id)
            .maybeSingle();

        if (!error && data) {
            const product = mapDBProductToClient(data);
            if (product.slug === slug) {
                return product;
            }
        }
    }

    const products = await fetchAllProducts();
    return products.find((p) => p.slug === slug);
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
    const products = await fetchAllProducts();
    return products.filter(
        (p) => p.category === product.category && p.id !== product.id
    ).slice(0, 4);
}

export async function fetchTrendingProducts(limit = 6): Promise<Product[]> {
    try {
        const [products, { data: items, error: itemsError }] = await Promise.all([
            fetchAllProducts(),
            supabase.from('order_items').select('product_id, quantity')
        ]);

        if (!products || products.length === 0) return [];

        const orderCounts: Record<string, number> = {};
        if (!itemsError && items) {
            items.forEach((item: any) => {
                const pid = String(item.product_id);
                orderCounts[pid] = (orderCounts[pid] || 0) + Number(item.quantity || 1);
            });
        }

        // Sort by order counts descending, fallback to ratingCount / rating
        const sorted = [...products].sort((a, b) => {
            const countA = orderCounts[String(a.id)] || 0;
            const countB = orderCounts[String(b.id)] || 0;
            if (countB !== countA) return countB - countA;
            return (b.ratingCount || 0) - (a.ratingCount || 0);
        });

        return sorted.slice(0, limit);
    } catch (err) {
        console.error("Error fetching trending products:", err);
        return [];
    }
}

export function parseImageUrls(productImages: any): string[] {
    if (!productImages) return [];
    const items = Array.isArray(productImages) ? productImages : [productImages];
    
    return items.flatMap((img: any) => {
        let raw = typeof img === 'string' ? img : (img?.image_url ?? img?.url ?? img);
        if (typeof raw === 'string') {
            raw = raw.trim();
            if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('{') && raw.endsWith('}'))) {
                try {
                    raw = JSON.parse(raw);
                } catch (e) {}
            }
        }
        if (Array.isArray(raw)) {
            return raw.map((item: any) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
        }
        if (typeof raw === 'string' && raw) {
            return [raw];
        }
        return [];
    }).filter((url: string) => typeof url === 'string' && url.length > 0);
}

export function mapDBProductToClient(row: any): Product {
    const images = parseImageUrls(row.product_images);
    const ratingSum = row.reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) || 0;
    const ratingCount = row.reviews?.length || 0;

    let specs = [];
    const rawSpecs = row.specifications || row.over_view?.specifications;
    if (rawSpecs && typeof rawSpecs === 'object') {
        const specKeys = Object.keys(rawSpecs);
        if (specKeys.length > 0 && !Array.isArray(rawSpecs)) {
            specs = specKeys.map(key => ({ label: key, value: String(rawSpecs[key]) }));
        } else if (Array.isArray(rawSpecs)) {
            specs = rawSpecs;
        }
    }

    const baseSlug = (row.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || "product";

    const dbDiscount = row.discount != null ? Number(row.discount) : undefined;
    const priceNum = Number(row.price || 0);
    const calculatedOldPrice = row.over_view?.oldPrice
        ? Number(row.over_view.oldPrice)
        : (dbDiscount && dbDiscount > 0 ? Number((priceNum / (1 - dbDiscount / 100)).toFixed(2)) : undefined);

    return {
        id: row.id.toString(),
        name: row.name || "Unknown Product",
        slug: `${baseSlug}-${row.id}`, 
        description: row.over_view?.description || "No description available",
        price: priceNum,
        discount: dbDiscount,
        oldPrice: calculatedOldPrice,
        brand: row.brand || "Unbranded",
        category: row.categories?.name || "Uncategorized",
        categorySlug: row.categories?.slug || (row.categories?.name ? row.categories.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined),
        images: images.length > 0 ? images : ["https://placehold.co/800?text=photo+unavailable&font=roboto"],
        inStock: Number(row.stock || 0) > 0,
        stock: Number(row.stock || 0),
        rating: ratingCount > 0 ? ratingSum / ratingCount : 0,
        ratingCount: ratingCount,
        specifications: specs,
        features: row.over_view?.features || [],
        aiRecommendation: row.over_view?.aiRecommendation || row.ai_recommendation || row.ai_review || undefined,
        createdAt: row.created_at || new Date().toISOString()
    };
}
