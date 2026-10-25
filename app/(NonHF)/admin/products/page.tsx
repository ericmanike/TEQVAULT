'use client';

import { useEffect, useState } from 'react';
import { 
  Search, Plus, Trash2, Edit, X, AlertCircle, ShoppingBag, ArrowUpDown, Filter, Sparkles 
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useFormik, Field, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/toastProvider';
import { deleteCloudinaryImage } from '@/lib/utils';
import ProductColorSelector from '@/components/ProductColorSelector';
import { parseImageUrls } from '@/lib/products';

interface Category {
  id: string;
  name: string;
}

interface ProductItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  stock: number;
  category: string;
  categoryId: string;
  imageUrl: string;
  images: string[];
  description: string;
  condition: string;
  overview: string;
  variants?: string[];
}

interface ProductFormValues {
  name: string;
  brand: string;
  price: string;
  discount: string;
  stock: string;
  category: string;
  condition:string;
  overview: string;
  description: string;
  imageFiles: File[];
}

const validationSchema = Yup.object({
  name: Yup.string().required('Product name is required').min(3, 'Name is too short'),
  brand: Yup.string().required('Brand is required'),
  price: Yup.number().required('Price is required').positive('Price must be greater than 0'),
  discount: Yup.number().min(0, 'Discount cannot be negative').max(99, 'Discount cannot exceed 99%').nullable().optional(),
  stock: Yup.number().required('Stock is required').min(0, 'Stock cannot be negative'),
  category: Yup.string().required('Category is required'),
  condition: Yup.string().required('Condition is required'),
  overview: Yup.string().required('Overview is required').min(5, 'Overview is too short'),
  description: Yup.string().required('Description is required').min(10, 'Description is too short'),
  imageFiles: Yup.array().of(Yup.mixed()).max(3, 'You can upload a maximum of 3 images')
});

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modals & UI States
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Fetch Products & Categories
  async function loadData() {
    try {
      setLoading(true);
      
      // 1. Fetch categories
      const { data: dbCategories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      setCategories(dbCategories || []);

      // 2. Fetch products
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select(`
          id, name, brand, price, discount, stock, condition, over_view, variants,
          categories(id, name),
          product_images(image_url)
        `);

      if (error) throw error;

      const mappedProducts: ProductItem[] = dbProducts?.map((row: any) => {
        const images = parseImageUrls(row.product_images);
        const overviewText = Array.isArray(row.over_view?.features) && row.over_view.features.length > 0
          ? row.over_view.features[0]
          : (row.over_view?.overview || '');
        const oldPrice = row.over_view?.oldPrice ? Number(row.over_view.oldPrice) : undefined;
        const priceNum = Number(row.price || 0);
        const dbDiscount = row.discount != null ? Number(row.discount) : undefined;
        const discountNum = dbDiscount ?? (oldPrice && oldPrice > priceNum
          ? Math.round(((oldPrice - priceNum) / oldPrice) * 100)
          : 0);
        const calculatedOldPrice = oldPrice ?? (dbDiscount && dbDiscount > 0
          ? Number((priceNum / (1 - dbDiscount / 100)).toFixed(2))
          : undefined);

        return {
          id: row.id.toString(),
          name: row.name || "Unknown Product",
          brand: row.brand || "Unbranded",
          price: priceNum,
          oldPrice: calculatedOldPrice,
          discount: discountNum,
          stock: Number(row.stock || 0),
          category: row.categories?.name || "Uncategorized",
          condition: row.condition || "New",
          categoryId: row.categories?.id?.toString() || "",
          imageUrl: images.length > 0 ? images[0] : "https://placehold.co/800?text=photo+unavailable&font=roboto",
          images: images,
          overview: overviewText,
          description: row.over_view?.description || "",
          variants: row.variants || []
        };
      }) || [];

      setProducts(mappedProducts);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Handle Sort
  const handleSort = (field: 'name' | 'price' | 'stock') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle Delete
  const handleDeleteProduct = async (id: string) => {
    try {
      setSubmitting(true);

      const targetProduct = products.find(p => p.id === id);
      if (targetProduct && targetProduct.images && targetProduct.images.length > 0) {
        // Permanently delete images from Cloudinary
        await Promise.all(targetProduct.images.map(imgUrl => deleteCloudinaryImage(imgUrl)));
      }

      // Delete images first
      await supabase.from('product_images').delete().eq('product_id', id);
      // Delete product
      const { error } = await supabase.from('products').delete().eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setProducts(products.filter(p => p.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting product:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Formik for product create/edit
  const formik = useFormik<ProductFormValues>({
    initialValues: {
      name: '',
      brand: '',
      price: '',
      discount: '',
      stock: '',
      category: '',
      overview: '',
      description: '',
      condition: '',
      imageFiles: []
    },
    validationSchema,
    onSubmit: async (values) => {
      const totalImages = existingImages.length + (values.imageFiles?.length || 0);
      if (totalImages === 0) {
        showToast("At least one product image is required", "error");
        return;
      }

      setSubmitting(true);
      try {
        // 1. Resolve or Create Category ID
        let categoryId = null;
        const matchingCat = categories.find(c => c.name.toLowerCase() === values.category.toLowerCase());
        
        if (matchingCat) {
          categoryId = matchingCat.id;
        } else {
          const { data: newCat, error: catError } = await supabase
            .from('categories')
            .insert({
              name: values.category,
              slug: values.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            })
            .select('id')
            .single();
          
          if (catError) throw catError;
          if (newCat) {
            categoryId = newCat.id;
            setCategories(prev => [...prev, { id: newCat.id, name: values.category }]);
          }
        }

        if (!user?.id) {
          showToast("Login required to save product", "error");
          return;
        }

        // 2. Upload New Images to Cloudinary if provided
        let uploadedUrls: string[] = [];
        if (values.imageFiles && values.imageFiles.length > 0) {
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwjvjjplu';
          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'letronix_preset';

          const uploadPromises = values.imageFiles.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
              method: 'POST',
              body: formData
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error?.message || `Cloudinary returned ${res.statusText}`);
            }

            const data = await res.json();
            if (data.secure_url) {
              return data.secure_url;
            } else {
              throw new Error("No secure_url returned from Cloudinary response");
            }
          });

          try {
            uploadedUrls = await Promise.all(uploadPromises);
          } catch (uploadError: any) {
            console.error('Cloudinary upload failed:', uploadError);
            showToast("Failed to upload new product images.", "error");
            setSubmitting(false);
            return;
          }
        }

        const finalImages = Array.from(new Set([...existingImages, ...uploadedUrls].filter(Boolean)));
        const primaryImage = finalImages.length > 0 ? finalImages : ["https://placehold.co/800?text=photo+unavailable&font=roboto"];

        const priceNum = Number(values.price);
        const discountNum = values.discount ? Number(values.discount) : 0;
        const calculatedOldPrice = discountNum > 0
          ? Number((priceNum / (1 - discountNum / 100)).toFixed(2))
          : undefined;

        const overviewData = {
          description: values.description,
          features: [values.overview],
          ...(calculatedOldPrice ? { oldPrice: calculatedOldPrice } : {})
        };

        if (editingProduct) {
          // UPDATE PRODUCT
          const { error: updateError } = await supabase
            .from('products')
            .update({
              name: values.name,
              brand: values.brand,
              category_id: categoryId,
              condition: values.condition,
              price: priceNum,
              discount: discountNum > 0 ? discountNum : 0,
              stock: Number(values.stock),
              over_view: overviewData,
              variants: selectedColors
            })
            .eq('id', editingProduct.id);

          if (updateError) throw updateError;

          // Replace product_images
          await supabase.from('product_images').delete().eq('product_id', editingProduct.id);

          const imageRows = primaryImage.map((url: string) => ({
            product_id: editingProduct.id,
            image_url: url
          }));
          await supabase.from('product_images').insert(imageRows);

          showToast("Product updated successfully! 🚀", "success");
        } else {
          // INSERT PRODUCT
          const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
              name: values.name,
              user_id: user.id,
              brand: values.brand,
              category_id: categoryId,
              condition: values.condition,
              price: priceNum,
              discount: discountNum > 0 ? discountNum : 0,
              stock: Number(values.stock),
              over_view: overviewData,
              variants: selectedColors
            })
            .select('id')
            .single();

          if (productError) throw productError;

          const imageRows = primaryImage.map((url: string) => ({
            product_id: product.id,
            image_url: url
          }));
          await supabase.from('product_images').insert(imageRows);

          showToast("Product published successfully! 🚀", "success");
        }

        setIsAddDrawerOpen(false);
        setEditingProduct(null);
        setExistingImages([]);
        formik.resetForm();
        await loadData();
      } catch (err: any) {
        showToast("Failed to save product!", "error");
        console.error("Error saving product:", err);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleEditProduct = (prod: ProductItem) => {
    setEditingProduct(prod);
    const cleanImages = parseImageUrls(prod.images || (prod.imageUrl ? [prod.imageUrl] : []));
    setExistingImages(Array.from(new Set(cleanImages)));
    setSelectedColors(prod.variants || []);
    formik.setValues({
      name: prod.name,
      brand: prod.brand,
      price: prod.price.toString(),
      discount: prod.discount ? prod.discount.toString() : '',
      stock: prod.stock.toString(),
      category: prod.category,
      condition: prod.condition,
      overview: prod.overview,
      description: prod.description,
      imageFiles: []
    });
    setIsAddDrawerOpen(true);
  };

  const handleOpenAddDrawer = () => {
    setEditingProduct(null);
    setExistingImages([]);
    setSelectedColors([]);
    formik.resetForm();
    setIsAddDrawerOpen(true);
  };

  // Filtered products list
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
      !selectedCategory || product.category === selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let compA = a[sortField];
    let compB = b[sortField];
    if (typeof compA === 'string') compA = compA.toLowerCase();
    if (typeof compB === 'string') compB = compB.toLowerCase();
    
    if (compA < compB) return sortOrder === 'asc' ? -1 : 1;
    if (compA > compB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Products Directory 
          </h1> 
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Manage your gadgets directory, catalog pricing, and inventory levels.
          </p>
        </div>
        <button
          onClick={handleOpenAddDrawer}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-orange-500/20 cursor-pointer"
        >
          <Plus size={18} />
          <span>Publish Gadget</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title, name, or brand..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition"
          />
        </div>

        {/* Category Filter */}
        <div className="relative w-full md:w-64 shrink-0">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition cursor-pointer appearance-none animate-in"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Listing / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="loader w-10 h-10 mb-2" />
          <p className="text-slate-500 font-semibold">Updating catalog directory...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-450">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h3 className="text-slate-800 font-bold text-lg">No Products Found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 leading-relaxed">
              There are no products matching your search query. Try broadening your criteria or list a new product.
            </p>
          </div>
          <button
            onClick={handleOpenAddDrawer}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold px-4 py-2 rounded-xl text-sm transition cursor-pointer"
          >
            Add Product
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('name')}>
                    <span className="flex items-center gap-1">Brand & Name <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('price')}>
                    <span className="flex items-center gap-1">Price <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('stock')}>
                    <span className="flex items-center gap-1">Inventory <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 border-b border-slate-100 transition duration-150">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">{prod.brand}</span>
                        <span className="font-bold text-slate-900 block text-sm leading-snug">{prod.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-xs bg-slate-100 border border-slate-200 text-slate-650 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">GHS {prod.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        {prod.oldPrice && prod.oldPrice > prod.price && (
                          <span className="text-[10px] text-slate-400 line-through font-normal">
                            GHS {prod.oldPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({prod.discount}% OFF)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        prod.stock > 10 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                          : prod.stock > 0 
                            ? 'bg-amber-50 border-amber-100 text-amber-700' 
                            : 'bg-rose-50 border-rose-100 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          prod.stock > 10 ? 'bg-emerald-500' : prod.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {prod.stock > 0 ? `${prod.stock} units` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-3.5">
                        <button 
                          onClick={() => handleEditProduct(prod)} 
                          className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 rounded-xl transition cursor-pointer shadow-2xs" 
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => setDeletingId(prod.id)}
                          className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl border border-slate-200 hover:border-rose-100 transition cursor-pointer shadow-2xs"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Delete Product</h3>
            <p className="text-slate-550 text-sm leading-relaxed">
              Are you sure you want to permanently delete this product? This action removes all dynamic catalogs and linked image listings.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                disabled={submitting}
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => deletingId && handleDeleteProduct(deletingId)}
                className="px-4 py-2 bg-red-500 hover:bg-red-650 text-white text-sm font-semibold rounded-lg transition cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? <Spinner className="size-3.5" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Side Drawer Modal */}
      {isAddDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full md:w-[70vw]  bg-white border-l border-slate-200 h-full overflow-y-auto p-6 md:p-8 flex flex-col space-y-6 shadow-2xl animate-in slide-in-from-right duration-350">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-250 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingProduct ? 'Edit Gadget Details' : 'Publish New Gadget'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingProduct ? `Modifying item: ${editingProduct.name}` : 'List an electronic gadget for sale on Swappi'}
                </p>
              </div>
              <button 
                onClick={() => setIsAddDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer border border-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {successMsg && (
              <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-semibold text-center ">
                {successMsg}
              </div>
            )}

            {/* Form */}
            <FormikProvider value={formik}>
              <form onSubmit={formik.handleSubmit} className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Product Name *
                    </label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      placeholder="e.g. iPhone 15 Pro Max"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="mt-1 text-[8px] md:text-sm text-red-500 flex items-center gap-1 font-semibold">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Brand & Category row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="brand" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Brand *
                      </label>
                      <Field
                        type="text"
                        id="brand"
                        name="brand"
                        placeholder="e.g. Apple"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition"
                      />
                      {formik.touched.brand && formik.errors.brand && (
                        <p className="mt-1 text-[8px] md:text-sm text-red-500 flex items-center gap-1 font-semibold">
                         {formik.errors.brand}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Category *
                      </label>
                      <Field
                        as="select"
                        id="category"
                        name="category"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                        <option value="Other Electronics">Other Electronics</option>
                      </Field>
                      {formik.touched.category && formik.errors.category && (
                        <p className="mt-1 text-[8px] md:text-sm text-red-500 flex items-center gap-1 font-semibold">
                          {formik.errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Stock row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div>
                      <label htmlFor="condition" className="block text-[9px] md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Condition *
                      </label>
                      <Field
                        as="select"
                        id="condition"
                        name="condition"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[9px] md:text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition cursor-pointer"
                      >
                        <option value="">Select Condition</option>
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                      </Field>
                      {formik.touched.condition && formik.errors.condition && (
                        <p className="mt-1 text-[8px] md:text-sm text-red-500 flex items-center gap-1 font-semibold">
                          {formik.errors.condition}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-[9px] md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Price (GHS) *
                      </label>
                      <Field
                        type="number"
                        id="price"
                        name="price"
                        step="50"
                        placeholder="1200.00"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition"
                      />
                      {formik.touched.price && formik.errors.price && (
                        <p className="mt-1 text-[8px] md:text-sm text-red-500 flex items-center gap-1 font-semibold">
                          {formik.errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="discount" className="block text-[9px] md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Discount (%)
                      </label>
                      <Field
                        type="number"
                        id="discount"
                        name="discount"
                        min="0"
                        max="99"
                        placeholder="e.g. 10"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition"
                      />
                      {formik.touched.discount && formik.errors.discount && (
                        <p className="mt-1 text-[8px] md:text-sm text-red-500 flex items-center gap-1 font-semibold">
                          {formik.errors.discount}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="stock" className="block text-[9px] md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                       Stock * 
                      </label>
                      <Field
                        type="number"
                        id="stock"
                        name="stock"
                        placeholder="5"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition"
                      />
                      {formik.touched.stock && formik.errors.stock && (
                        <p className="mt-1 text-[8px] md:text-sm text-red-500 flex items-center gap-1 font-semibold">
                          {formik.errors.stock}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-[9px] md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Product Images (Up to 3) *
                    </label>
                    
                    <div className="space-y-4">
                      {/* Grid showing existing & newly selected image previews */}
                      {(existingImages.length > 0 || (formik.values.imageFiles && formik.values.imageFiles.length > 0)) && (
                        <div className="grid grid-cols-3 gap-3">
                          {/* Existing Images */}
                          {existingImages.map((url, idx) => (
                            <div key={`existing-${idx}`} className="relative aspect-square border border-slate-200 rounded-xl overflow-hidden bg-slate-50 group">
                              <img
                                src={url}
                                alt={`Existing ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteCloudinaryImage(url);
                                    setExistingImages(prev => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="p-1.5 bg-red-500 hover:bg-red-650 text-white rounded-full transition cursor-pointer animate-in zoom-in-50"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1 bg-slate-900/70 backdrop-blur-xs text-[9px] text-white px-1.5 py-0.5 rounded font-black">
                                Saved #{idx + 1}
                              </span>
                            </div>
                          ))}

                          {/* New Files */}
                          {formik.values.imageFiles?.map((file, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-square border border-slate-200 rounded-xl overflow-hidden bg-slate-50 group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextFiles = formik.values.imageFiles.filter((_, i) => i !== idx);
                                    formik.setFieldValue('imageFiles', nextFiles);
                                  }}
                                  className="p-1.5 bg-red-500 hover:bg-red-650 text-white rounded-full transition cursor-pointer animate-in zoom-in-50"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1 bg-orange-500 text-[9px] text-white px-1.5 py-0.5 rounded font-black">
                                New
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Dropzone */}
                      {(existingImages.length + (formik.values.imageFiles?.length || 0)) < 3 && (
                        <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100/50 hover:border-orange-500/50 transition duration-200">
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-4">
                            <Plus className="text-slate-400 w-8 h-8 mb-2 animate-bounce" />
                            <span className="text-xs font-bold text-slate-600">
                              {(existingImages.length + (formik.values.imageFiles?.length || 0)) > 0
                                ? `Add more images (${existingImages.length + (formik.values.imageFiles?.length || 0)}/3)`
                                : "Click to upload product images"}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                              PNG, JPG, JPEG (Max 3 files, 5MB each)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.currentTarget.files || []);
                                const currentFiles = formik.values.imageFiles || [];
                                const combined = [...currentFiles, ...files];
                                const maxAllowed = 3 - existingImages.length;
                                const uniqueCombined = combined.filter((file, idx, self) =>
                                  self.findIndex(f => f.name === file.name && f.size === file.size) === idx
                                ).slice(0, maxAllowed);
                                formik.setFieldValue('imageFiles', uniqueCombined);
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {formik.touched.imageFiles && formik.errors.imageFiles && (
                      <p className="mt-1 text-[8px] md:text-sm text-red-500 flex items-center gap-1 font-semibold">
                         {String(formik.errors.imageFiles)}
                      </p>
                    )}
                  </div>

                  {/* Color Variant Options (Frontend Only - Up to 3 Colors) */}
                  <ProductColorSelector
                    selectedColors={selectedColors}
                    onChange={setSelectedColors}
                  />

                  {/* Overview summary */}
                  <div>
                    <label htmlFor="overview" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Overview Summary *
                    </label>
                    <Field
                      type="text"
                      id="overview"
                      name="overview"
                      placeholder="e.g. Excellent flagship smartphone with pristine dynamic displays."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition"
                    />
                    {formik.touched.overview && formik.errors.overview && (
                      <p className="mt-1 text-[8px] md:text-sm text-red-500 flex items-center gap-1 font-semibold">
                       {formik.errors.overview}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Specifications & Details *
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={3}
                      placeholder="Explain features, specs, size, and package components in detail..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition resize-none text-slate-800"
                    />
                    {formik.touched.description && formik.errors.description && (
                      <p className="mt-1 text-[8px] md:text-sm text-red-500 flex items-center gap-1 font-semibold">
                         {formik.errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex gap-4 pt-6 border-t border-slate-200 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      formik.resetForm();
                      setIsAddDrawerOpen(false);
                    }}
                    className="flex-1 py-3 px-6 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-sm cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && <Spinner className="size-4" />}
                    <span>{editingProduct ? 'Save Changes' : 'Publish Gadget'}</span>
                  </button>
                </div>
              </form>
            </FormikProvider>

          </div>
        </div>
      )}

    </div>
  );
}
