import { createContext, useState, useEffect, useRef, useContext } from "react";
import productService from "../services/productService";
import { robustFetch } from "../utils/fetchUtils";
import { API_BASE_URL } from "../config/constants";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
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
          console.log("🔍 ProductContext: Fetching products and services...");

          // Fetch both products, services, and vendor products
          const [productsData, servicesData, vendorProductsData] =
            await Promise.all([
              productService.getProducts().catch((err) => {
                console.error("❌ Products API failed:", err);
                return { data: [] };
              }),
              fetch(`${API_BASE_URL}/services`)
                .then((r) => r.json())
                .catch((err) => {
                  console.error("❌ Services API failed:", err);
                  return { data: [] };
                }),
              robustFetch("/vendor-products")
                .then((r) => {
                  if (r.status === 401 || r.status === 403) {
                    console.log(
                      "🔒 Vendor products requires authentication - skipping",
                    );
                    return { data: [] };
                  }
                  return r.json();
                })
                .catch((error) => {
                  console.log("❌ Vendor products failed:", error.message);
                  return { data: [] };
                }),
            ]);

          console.log("✅ ProductContext: Products response:", productsData);
          console.log("✅ ProductContext: Services response:", servicesData);
          console.log(
            "✅ ProductContext: Vendor Products response:",
            vendorProductsData,
          );

          // Handle products
          let productsArray = Array.isArray(productsData)
            ? productsData
            : productsData?.data || productsData?.products || [];

          // Handle services
          let servicesArray = Array.isArray(servicesData)
            ? servicesData
            : servicesData?.data || servicesData?.services || [];

          // Handle vendor products
          let vendorProductsArray = Array.isArray(vendorProductsData)
            ? vendorProductsData
            : vendorProductsData?.data || vendorProductsData?.products || [];

          console.log("✅ Products count:", productsArray.length);
          console.log("✅ Services count:", servicesArray.length);
          console.log("✅ Vendor Products count:", vendorProductsArray.length);
          console.log(
            "✅ Total Products (excluding services):",
            productsArray.length + vendorProductsArray.length,
          );

          // Combine only products and vendor products (services should be separate)
          // Remove duplicates based on _id or id
          const allProducts = [...productsArray, ...vendorProductsArray];
          const uniqueProducts = allProducts.filter(
            (product, index, self) =>
              index ===
              self.findIndex(
                (p) => (p._id || p.id) === (product._id || product.id),
              ),
          );
          const finalProducts = uniqueProducts;

          console.log("Deduplication results:");
          console.log("- Combined products:", allProducts.length);
          console.log("- After deduplication:", uniqueProducts.length);
          console.log(
            "- Removed duplicates:",
            allProducts.length - uniqueProducts.length,
          );

          const transformedProducts = finalProducts.map((p) => {
            // Handle images - services use bannerImage, products use thumbnail
            let thumbnail = p.thumbnail || p.bannerImage || p.images?.[0];

            // Safe stock handling with fallback
            const stockValue = Number(p.stock) || 0;

            // Log stock values for debugging
            if (p.stock === undefined || p.stock === null) {
              console.warn(
                `⚠️ Product "${p.name}" missing stock field, defaulting to 0`,
              );
            }

            return {
              _id: p._id || p.id,
              id: p._id || p.id,
              name: p.name || p.product_name_en || "Decoration Item",
              description: p.description || p.product_description_en || "",
              price: p.price || p.unit_price || 0,
              thumbnail: thumbnail || null,
              category: p.category || p.serviceType || "other",
              featured: p.featured === true || p.is_featured === true,
              stockQuantity: stockValue,
              stock: stockValue, // Add both for compatibility
              tags: p.tags || [],
              sku: p.sku || null,
              type: p.serviceType
                ? "service"
                : p.vendorId || p.is_vendor_product
                  ? "vendor-product"
                  : "product",
            };
          });

          setProducts(transformedProducts);

          // Filter featured products
          const featured = transformedProducts.filter((product) => {
            const isFeatured =
              product.featured === true ||
              product.is_featured === true ||
              product.is_featured === "true" ||
              product.is_featured === 1;

            // Only show actual featured products (not all products)
            return isFeatured;
          });

          // Transform services to match product structure
          const transformedServices = servicesArray.map((service) => ({
            _id: service._id || service.id,
            id: service._id || service.id,
            name: service.name || "Service",
            description: service.description || "",
            price: service.price || 0,
            thumbnail:
              service.thumbnail ||
              service.bannerImage ||
              service.images?.[0] ||
              null,
            category: service.category || "service",
            featured: service.featured === true || service.is_featured === true,
            stockQuantity: service.stock || 0,
            tags: service.tags || [],
            sku: service.sku || null,
            type: "service",
          }));

          // Filter featured services
          const featuredServices = transformedServices.filter((service) => {
            const isFeatured =
              service.featured === true ||
              service.is_featured === true ||
              service.is_featured === "true" ||
              service.is_featured === 1;

            return isFeatured;
          });

          // Combine featured products and services
          const allFeatured = [...featured, ...featuredServices];
          setFeaturedProducts(allFeatured);
          console.log(" ProductContext: Featured products:", featured);
          console.log(" ProductContext: Featured services:", featuredServices);
          console.log(" ProductContext: All featured items:", allFeatured);

          console.log(
            " ProductContext: Fetched",
            transformedProducts.length,
            "products",
          );
          console.log(
            "✅ ProductContext: Featured",
            featured.length,
            "products",
          );
          console.log(
            "✅ ProductContext: Sample product:",
            transformedProducts[0],
          );
          // Set services separately for the services page (use transformed services)
          setServices(transformedServices);

          console.log(
            " ProductContext: Products state set:",
            transformedProducts,
          );
          console.log(
            " ProductContext: Services state set:",
            transformedServices,
          );
        } catch (err) {
          console.error(" ProductContext: Error fetching products:", err);
          setError("Failed to load products");
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
    services,
    featuredProducts,
    categories,
    loading,
    error,
    refetch: async () => {
      try {
        setLoading(true);
        setError(null);
        const productsData = await productService.getProducts();
        const productsArray =
          productsData?.products || productsData?.data || productsData || [];

        const transformedProducts = productsArray.map((p) => {
          // Handle image fields for both regular and vendor products
          let thumbnail = p.thumbnail;

          // For vendor products, use first image from images array if no thumbnail
          if (!thumbnail && p.images && p.images.length > 0) {
            thumbnail = p.images[0];
          }

          // Safe stock handling with fallback
          const stockValue = Number(p.stock) || 0;

          // Log stock values for debugging
          if (p.stock === undefined || p.stock === null) {
            console.warn(
              `⚠️ Product "${p.name}" missing stock field in refetch, defaulting to 0`,
            );
          }

          return {
            ...p,
            name: p.product_name_en || p.name || "Decoration Item",
            description: p.description_en || p.description || "",
            price: p.unit_price || p.price || 0,
            id: p._id || p.id,
            thumbnail: thumbnail || null,
            category: p.category || p.category_id || "other",
            featured: p.featured || p.is_featured || false,
            stockQuantity: stockValue,
            stock: stockValue, // Add both for compatibility
            tags: p.tags || [],
            source: p.source || "admin", // Track if product is from vendor or admin
            sku: p.sku || null,
          };
        });

        setProducts(transformedProducts);

        const featured = transformedProducts.filter((product) => {
          const isFeatured =
            product.featured === true ||
            product.is_featured === true ||
            product.is_featured === "true" ||
            product.is_featured === 1;

          // Exclude services from homepage featured products (only show actual products)
          const isProduct =
            product.type !== "service" &&
            !product.serviceType &&
            product.status !== "service" &&
            product.status !== "vendor";

          return isFeatured && isProduct;
        });
        setFeaturedProducts(featured);

        console.log(
          "✅ ProductContext: Refetched",
          transformedProducts.length,
          "products",
        );
      } catch (err) {
        console.error("❌ ProductContext: Error refetching products:", err);
        setError("Failed to reload products");
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
