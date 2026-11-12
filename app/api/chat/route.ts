import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { mapDBProductToClient, Product } from '@/lib/products';
import { formatCurrency } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QueryIntent {
  keywords: string[];
  maxPrice: number | null;
  isDealsQuery: boolean;
  isOrderQuery: boolean;
  isInstallmentQuery: boolean;
  isCategoryQuery: boolean;
  isContactOrStoreQuery: boolean;
}

interface ActionLink {
  label: string;
  href: string;
}

interface ChatProductCard {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount?: number;
  slug: string;
  image: string;
  stock: number;
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'about', 'at', 'available', 'best', 'buy', 'can',
  'cedis', 'cheap', 'cheapest', 'check', 'could', 'do', 'does', 'find', 'for',
  'from', 'get', 'ghs', 'good', 'have', 'hello', 'help', 'hey', 'hi', 'how',
  'i', 'in', 'info', 'information', 'is', 'it', 'less', 'like', 'looking',
  'max', 'maximum', 'me', 'more', 'much', 'my', 'need', 'of', 'on', 'or',
  'please', 'price', 'prices', 'product', 'products', 'recommend', 'see',
  'sell', 'show', 'some', 'tell', 'teqvault', 'than', 'thank', 'thanks',
  'that', 'the', 'there', 'this', 'to', 'under', 'below', 'want', 'what',
  'whats', 'where', 'which', 'with', 'you', 'your'
]);

function parseQueryIntent(rawQuery: string): QueryIntent {
  const lower = rawQuery.toLowerCase();

  let maxPrice: number | null = null;
  const priceMatch = lower.match(
    /(?:under|below|less than|max|maximum|budget|within|<=)\s*(?:ghs|gh₵|₵)?\s*([\d,]+(?:\.\d+)?)/i
  );
  if (priceMatch?.[1]) {
    const parsed = Number(priceMatch[1].replace(/,/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) {
      maxPrice = parsed;
    }
  }

  const tokens = lower
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t) && !/^\d+$/.test(t));

  const keywords = Array.from(new Set(tokens));

  return {
    keywords,
    maxPrice,
    isDealsQuery: /\b(falaa|deal|deals|discount|discounts|sale|promo|offer|offers)\b/i.test(lower),
    isOrderQuery: /\b(order|orders|track|tracking|shipping|delivery|shipped|package)\b/i.test(lower),
    isInstallmentQuery: /\b(pay small|installment|installments|layaway|finance|financing|balance)\b/i.test(lower),
    isCategoryQuery: /\b(category|categories|catalog|what do you sell|items)\b/i.test(lower),
    isContactOrStoreQuery: /\b(location|store|address|kumasi|knust|accra|ghana|hours|open|contact|call|phone|whatsapp|email)\b/i.test(lower),
  };
}

function scoreProductMatch(product: Product, keywords: string[]): number {
  if (keywords.length === 0) return 0;

  const nameLower = product.name.toLowerCase();
  const brandLower = product.brand.toLowerCase();
  const categoryLower = product.category.toLowerCase();
  const descLower = product.description.toLowerCase();
  const specsText = (product.specifications || [])
    .map((s) => `${s.label} ${s.value}`)
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const kw of keywords) {
    const singular = kw.endsWith('s') && kw.length > 3 ? kw.slice(0, -1) : kw;
    if (nameLower.includes(kw) || nameLower.includes(singular)) score += 5;
    if (brandLower.includes(kw) || brandLower.includes(singular)) score += 4;
    if (categoryLower.includes(kw) || categoryLower.includes(singular)) score += 3;
    if (specsText.includes(kw) || specsText.includes(singular)) score += 2;
    if (descLower.includes(kw) || descLower.includes(singular)) score += 1;
  }
  return score;
}

async function searchCatalog(
  client: SupabaseClient,
  intent: QueryIntent
) {
  const [{ data: categoriesData }, productsResult] = await Promise.all([
    client.from('categories').select('id, name, slug').order('id'),
    (() => {
      let query = client
        .from('products')
        .select(`
          id, name, brand, price, discount, stock, over_view, specifications, created_at,
          categories(id, name, slug),
          product_images(image_url),
          reviews(rating)
        `)
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(80);

      if (intent.maxPrice !== null) {
        query = query.lte('price', intent.maxPrice);
      }
      if (intent.isDealsQuery) {
        query = query.gt('discount', 0);
      }
      return query;
    })(),
  ]);

  const categories = (categoriesData || []).map((c: any) => ({
    name: c.name,
    slug: c.slug,
  }));

  const allInStock = (productsResult.data || []).map(mapDBProductToClient);

  let matchedProducts: Product[] = [];
  if (intent.keywords.length > 0) {
    matchedProducts = allInStock
      .map((product) => ({ product, score: scoreProductMatch(product, intent.keywords) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry) => entry.product);
  }

  // Fallback for deals, budget queries, or general catalog browsing
  if (matchedProducts.length === 0 && (intent.isDealsQuery || intent.maxPrice !== null || intent.isCategoryQuery)) {
    matchedProducts = allInStock.slice(0, 5);
  }

  return {
    categories,
    matchedProducts,
    sampleCatalog: allInStock.slice(0, 6),
  };
}

function summarizeProductsForPrompt(products: Product[]) {
  return products.map((p) => ({
    name: p.name,
    brand: p.brand,
    category: p.category,
    price_ghs: p.price,
    discount_percent: p.discount || 0,
    stock: p.stock,
    description: p.description.slice(0, 180),
    specs: (p.specifications || []).slice(0, 5),
    url: `/products/${p.slug}`,
  }));
}

function toProductCards(products: Product[]): ChatProductCard[] {
  return products.slice(0, 3).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    discount: p.discount,
    slug: p.slug,
    image: p.images[0],
    stock: p.stock,
  }));
}

function pickActionLink(
  intent: QueryIntent,
  isAuthenticated: boolean,
  hasMatchedProducts: boolean
): ActionLink | undefined {
  if (intent.isOrderQuery) {
    return isAuthenticated
      ? { label: 'View My Orders', href: '/customer/orders' }
      : { label: 'Sign In to Track Orders', href: '/auth/login?redirectTo=/customer/orders' };
  }
  if (intent.isInstallmentQuery) {
    return isAuthenticated
      ? { label: 'View My Pay Small Small', href: '/customer/pay-small-small' }
      : { label: 'Explore Pay Small Small', href: '/customer/pay-small-small' };
  }
  if (intent.isDealsQuery) {
    return { label: 'View Falaa Deals', href: '/shop?deals=true' };
  }
  if (intent.isContactOrStoreQuery) {
    return { label: 'Contact Support', href: '/contact' };
  }
  if (hasMatchedProducts || intent.isCategoryQuery) {
    return { label: 'Browse All Products', href: '/shop' };
  }
  return undefined;
}

function buildFallbackReply(
  intent: QueryIntent,
  context: {
    categories: { name: string }[];
    matchedProducts: Product[];
    orders: any[];
    installments: any[];
    isAuthenticated: boolean;
  }
): string {
  if (intent.isOrderQuery) {
    if (!context.isAuthenticated) {
      return 'Please sign in to your TEQVAULT account so I can check your live order statuses for you.';
    }
    if (context.orders.length === 0) {
      return "You don't have any orders on your account yet. Browse our shop to place your first order!";
    }
    const latest = context.orders[0];
    return `Your most recent order (#${latest.id}) is currently "${latest.status}" for ${formatCurrency(Number(latest.total || 0))}. You have ${context.orders.length} recent order(s) in your dashboard.`;
  }

  if (intent.isInstallmentQuery) {
    if (!context.isAuthenticated || context.installments.length === 0) {
      return 'With Pay Small Small, you can reserve any gadget with a flexible down payment and pay the balance in scheduled installments. Sign in to view your active plans.';
    }
    const active = context.installments[0];
    return `Your Pay Small Small plan for ${active.product_name} is "${active.status}" with a remaining balance of ${formatCurrency(Number(active.balance_amount || 0))}.`;
  }

  if (context.matchedProducts.length > 0) {
    const list = context.matchedProducts
      .slice(0, 3)
      .map((p) => `${p.name} (${formatCurrency(p.price)}${p.discount ? `, ${p.discount}% off` : ''})`)
      .join(', ');
    return `Here is what I found in stock right now: ${list}. Click any product below to view full details!`;
  }

  if (intent.isCategoryQuery && context.categories.length > 0) {
    return `We currently stock products across: ${context.categories.map((c) => c.name).join(', ')}. Ask me for any specific device or budget!`;
  }

  if (intent.isContactOrStoreQuery) {
    return 'TEQVAULT operates in Ghana (Mon–Sat, 8:00 AM – 8:00 PM). You can call or WhatsApp us on 054 344 2518 or email support@teqvault.app.';
  }

  return 'I can help you search in-stock laptops, phones, and accessories, check Falaa Deals, or look up your orders and Pay Small Small plans. What are you looking for today?';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessages: IncomingMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const lastUserMessage = [...rawMessages].reverse().find((m) => m.role === 'user')?.content?.trim();

    if (!lastUserMessage) {
      return NextResponse.json({ error: 'A user message is required.' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    const dbClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined
    );

    let userId: string | null = null;
    if (token) {
      const { data: userData } = await dbClient.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }

    const intent = parseQueryIntent(lastUserMessage);
    const catalog = await searchCatalog(dbClient, intent);

    let orders: any[] = [];
    let installments: any[] = [];

    if (userId) {
      const queries: Promise<void>[] = [];

      if (intent.isOrderQuery) {
        queries.push(
          (async () => {
            const { data } = await dbClient
              .from('orders')
              .select('id, status, total, created_at, order_items(quantity, price, products(name, brand))')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(5);
            orders = data || [];
          })()
        );
      }

      if (intent.isInstallmentQuery) {
        queries.push(
          (async () => {
            const { data } = await dbClient
              .from('pay_small_small')
              .select('id, product_name, total_amount, paid_amount, balance_amount, frequency, status, created_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(5);
            installments = data || [];
          })()
        );
      }

      await Promise.all(queries);
    }

    const isAuthenticated = Boolean(userId);
    const actionLink = pickActionLink(intent, isAuthenticated, catalog.matchedProducts.length > 0);
    const productCards =
      !intent.isOrderQuery && !intent.isInstallmentQuery && catalog.matchedProducts.length > 0
        ? toProductCards(catalog.matchedProducts)
        : undefined;

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      return NextResponse.json({
        reply: buildFallbackReply(intent, {
          categories: catalog.categories,
          matchedProducts: catalog.matchedProducts,
          orders,
          installments,
          isAuthenticated,
        }),
        actionLink,
        products: productCards,
      });
    }

    const liveDbContext = {
      store_info: {
        name: 'TEQVAULT',
        currency: 'GH₵ (GHS)',
        location: 'Ghana',
        hours: 'Monday – Saturday, 8:00 AM – 8:00 PM',
        phone_whatsapp: '054 344 2518',
        email: 'support@teqvault.app',
        pay_small_small_summary: 'Flexible layaway/installment plan: pay a down payment to reserve a product and complete the balance in scheduled installments.',
      },
      categories: catalog.categories.map((c) => c.name),
      matched_in_stock_products: summarizeProductsForPrompt(catalog.matchedProducts),
      sample_featured_products:
        catalog.matchedProducts.length === 0 ? summarizeProductsForPrompt(catalog.sampleCatalog) : [],
      user_authenticated: isAuthenticated,
      user_orders: intent.isOrderQuery ? orders : undefined,
      user_pay_small_small_plans: intent.isInstallmentQuery ? installments : undefined,
    };

    const conversationHistory = rawMessages
      .slice(-8)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').slice(0, 1000),
      }));

    const model = process.env.OPENROUTER_MODEL || 'openrouter/free';

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://teqvault.app',
        'X-Title': 'TEQVAULT AI Support Consultant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content:
              `You are TEQVAULT's helpful shopping & support consultant in Ghana.\n` +
              `Rules:\n` +
              `1. Use ONLY facts, product names, prices (in GH₵), discounts, stock, order statuses, and Pay Small Small balances from LIVE_DATABASE_CONTEXT below.\n` +
              `2. Never invent or guess products, prices, stock, or order details.\n` +
              `3. If matched_in_stock_products is empty for a specific item request, politely state that you couldn't find an exact match in stock right now and suggest browsing /shop or checking sample_featured_products.\n` +
              `4. If the user asks about personal orders or Pay Small Small balances and user_authenticated is false, tell them to sign in first.\n` +
              `5. Keep responses concise (2–4 sentences), friendly, and plain text (no markdown tables).\n\n` +
              `LIVE_DATABASE_CONTEXT:\n${JSON.stringify(liveDbContext)}`,
          },
          ...conversationHistory,
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => '');
      console.warn('[Chat API] OpenRouter returned non-OK:', aiRes.status, errText);
      return NextResponse.json({
        reply: buildFallbackReply(intent, {
          categories: catalog.categories,
          matchedProducts: catalog.matchedProducts,
          orders,
          installments,
          isAuthenticated,
        }),
        actionLink,
        products: productCards,
      });
    }

    const aiData = await aiRes.json();
    const aiReply = aiData?.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({
      reply:
        aiReply ||
        buildFallbackReply(intent, {
          categories: catalog.categories,
          matchedProducts: catalog.matchedProducts,
          orders,
          installments,
          isAuthenticated,
        }),
      actionLink,
      products: productCards,
    });
  } catch (err: any) {
    console.error('[Chat API] Error:', err);
    return NextResponse.json(
      { error: 'Unable to process chat request right now.' },
      { status: 500 }
    );
  }
}
