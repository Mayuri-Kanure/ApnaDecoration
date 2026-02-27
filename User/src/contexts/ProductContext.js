import { createContext, useState, useEffect, useRef, useContext } from 'react';
import productService from '../services/productService';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const mounted = useRef(false);
  const productsLoadedRef = useRef(false);

  // Fetch all data once when component mounts
  useEffect(() => {
    if (productsLoadedRef.current) return;
    productsLoadedRef.current = true;

    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          console.log('🔍 ProductContext: Fetching products and services...');
          
          // Fetch both products, services, and vendor products
          const token = localStorage.getItem('token');
          const vendorHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
          const [productsData, servicesData, vendorProductsData] = await Promise.all([
            productService.getProducts().catch(() => ({ data: [] })),
            fetch(`${process.env.REACT_APP_PRODUCT_API_URL}/services`).then(r => r.json()).catch(() => ({ data: [] })),
            fetch(`${process.env.REACT_APP_PRODUCT_API_URL}/vendor-products`, {
              headers: vendorHeaders
            }).then(r => r.json()).catch(() => ({ data: [] }))
          ]);
          
          console.log('✅ ProductContext: Products response:', productsData);
          console.log('✅ ProductContext: Services response:', servicesData);
          console.log('✅ ProductContext: Vendor Products response:', vendorProductsData);

          // Handle products
          let productsArray = Array.isArray(productsData) ? productsData : 
            (productsData?.data || productsData?.products || []);
          
          // Handle services
          let servicesArray = Array.isArray(servicesData) ? servicesData : 
            (servicesData?.data || servicesData?.services || []);
          
          // Handle vendor products
          let vendorProductsArray = Array.isArray(vendorProductsData) ? vendorProductsData : 
            (vendorProductsData?.data || vendorProductsData?.products || []);
          
          console.log('✅ Products count:', productsArray.length);
          console.log('✅ Services count:', servicesArray.length);
          console.log('✅ Vendor Products count:', vendorProductsArray.length);
          
          // Combine products, services, and vendor products
          const finalProducts = [...productsArray, ...servicesArray, ...vendorProductsArray];
          
          const transformedProducts = finalProducts.map(p => {
            // Handle images - services use bannerImage, products use thumbnail
            let thumbnail = p.thumbnail || p.bannerImage || (p.images?.[0]);
            
            return {
              _id: p._id || p.id,
              id: p._id || p.id,
              name: p.name || p.product_name_en || 'Decoration Item',
              description: p.description || p.product_description_en || '',
              price: p.price || p.unit_price || 0,
              thumbnail: thumbnail || null,
              category: p.category || p.serviceType || 'other',
              featured: p.featured === true || p.is_featured === true,
              stockQuantity: p.stock || p.stock_qty || 0,
              tags: p.tags || [],
              sku: p.sku || null,
              type: p.serviceType ? 'service' : (p.vendorId || p.is_vendor_product ? 'vendor-product' : 'product')
            };
          });

          setProducts(transformedProducts);

          // Filter featured products
          const featured = transformedProducts.filter(product => {
            const isFeatured = product.featured === true ||
              product.is_featured === true ||
              product.is_featured === 'true' ||
              product.is_featured === 1 ||
              product.featured === 'true' ||
              product.featured === 1;
            console.log('🔍 Checking featured for:', product.name, '- featured:', product.featured, '- isFeatured:', isFeatured);
            return isFeatured;
          });
          setFeaturedProducts(featured);
          console.log('✅ ProductContext: Featured products:', featured);

          console.log('✅ ProductContext: Fetched', transformedProducts.length, 'products');
          console.log('✅ ProductContext: Featured', featured.length, 'products');
          console.log('✅ ProductContext: Sample product:', transformedProducts[0]);
          console.log('✅ ProductContext: Products state set:', transformedProducts);

        } catch (err) {
          console.error('❌ ProductContext: Error fetching products:', err);
          setError('Failed to load products');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, 1500); // 1500ms delay to avoid rate limiting

    return () => clearTimeout(timer);
  }, []); // Empty dependency array - only run once on mount

  const value = {
    products,
    featuredProducts,
    categories,
    loading,
    error,
    refetch: async () => {
      try {
        setLoading(true);
        setError(null);
        const productsData = await productService.getProducts();
        const productsArray = productsData?.products || productsData?.data || productsData || [];
        
        const transformedProducts = productsArray.map(p => {
          // Handle image fields for both regular and vendor products
          let thumbnail = p.thumbnail;
          
          // For vendor products, use first image from images array if no thumbnail
          if (!thumbnail && p.images && p.images.length > 0) {
            thumbnail = p.images[0];
          }
          
          return {
            ...p,
            name: p.product_name_en || p.name || 'Decoration Item',
            description: p.description_en || p.description || '',
            price: p.unit_price || p.price || 0,
            id: p._id || p.id,
            thumbnail: thumbnail || null,
            category: p.category || p.category_id || 'other',
            featured: p.featured || p.is_featured || false,
            stockQuantity: p.stock_qty || p.stockQuantity || 0,
            tags: p.tags || [],
            source: p.source || 'admin', // Track if product is from vendor or admin
            sku: p.sku || null
          };
        });
        
        setProducts(transformedProducts);
        
        const featured = transformedProducts.filter(product => {
          const isFeatured = product.featured === true ||
            product.is_featured === true ||
            product.is_featured === 'true' ||
            product.is_featured === 1;
          return isFeatured;
        });
        setFeaturedProducts(featured);
        
        console.log('✅ ProductContext: Refetched', transformedProducts.length, 'products');
        
      } catch (err) {
        console.error('❌ ProductContext: Error refetching products:', err);
        setError('Failed to reload products');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
