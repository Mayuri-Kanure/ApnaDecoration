import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { robustFetch, resetEndpointStatus } from "../utils/fetchUtils";
import { useAuth } from "./AuthContext";
import apiService from "../services/api";

const CartContext = createContext();

// Helper function for category normalization (single source of truth)
const normalizeCategory = (category) => {
  if (!category) return "";
  if (typeof category === "object") return category.name || "";
  return category;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Get authentication state
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    console.log("Initializing cart from localStorage:", saved);
    const parsed = saved ? JSON.parse(saved) : [];

    // Clean old dirty data
    const cleaned = parsed.map((item) => ({
      ...item,
      category: normalizeCategory(item.category),
    }));

    console.log("Cleaned cart items:", cleaned);
    return cleaned;
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    console.log("Initializing wishlist from localStorage:", saved);
    const parsed = saved ? JSON.parse(saved) : [];

    // Clean old dirty data
    const cleaned = parsed.map((item) => ({
      ...item,
      category: normalizeCategory(item.category),
    }));

    console.log("Cleaned wishlist items:", cleaned);
    return cleaned;
  });

  // Handle authentication state changes
  useEffect(() => {
    console.log(
      "🛒 CartContext - Authentication state changed:",
      isAuthenticated,
    );

    // Reset endpoint status when auth changes to allow retrying
    resetEndpointStatus();

    if (!isAuthenticated) {
      console.log("🛒 CartContext - User logged out, clearing cart only");
      setCartItems([]); // Clear cart when user logs out
      // Don't clear wishlist - keep it in localStorage
    } else {
      console.log("🛒 CartContext - User logged in, loading cart and wishlist");

      // Debug: Check what's in localStorage before loading
      const existingWishlist = localStorage.getItem("wishlist");
      if (existingWishlist) {
        try {
          const parsed = JSON.parse(existingWishlist);
          console.log("🛒 Debug - Existing wishlist in localStorage:", parsed);
          const coffeeMug = parsed.find(
            (item) =>
              item.name &&
              (item.name.toLowerCase().includes("coffee") ||
                item.name.toLowerCase().includes("mug")),
          );
          console.log("🛒 Debug - Looking for coffee mug:", coffeeMug);
          if (coffeeMug) {
            console.log("🛒 Debug - Coffee mug details:", {
              name: coffeeMug.name,
              _id: coffeeMug._id,
              id: coffeeMug.id,
              source: "localStorage",
            });
          }
        } catch (e) {
          console.error("🛒 Debug - Error parsing wishlist:", e);
        }
      }

      loadCartFromAPI(); // Load cart when user logs in
      loadWishlistFromAPI(); // Load wishlist from API
    }
  }, [isAuthenticated]);

  const loadCartFromAPI = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartItems([]);
      return;
    }
    try {
      // First try the user-specific API endpoint
      const res = await robustFetch("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const rawCartItems = data?.data?.items || [];
      // Transform cart items to flatten product data
      const transformedItems = rawCartItems
        .map((item) => {
          const product = item.product;
          if (!product) {
            console.warn("Cart item missing product data:", item);
            return null;
          }
          return {
            cartItemId: item._id,
            productId: product._id,
            id: product._id,
            _id: product._id,
            name: product.name || product.product_name_en || "Product",
            description:
              product.description ||
              product.description_en ||
              "No description available",
            price: item.price || product.price || product.unit_price || 0,
            unit_price: item.price || product.price || product.unit_price || 0,
            quantity: item.quantity || 1,
            thumbnail:
              product.thumbnail ||
              (product.images && product.images[0]) ||
              product.image ||
              null,
            image: product.image || product.thumbnail || null,
            images: product.images || [],
            sku: product.sku || "N/A",
            stock: product.stock || product.stock || 0,
            category: normalizeCategory(product.category),
            specifications: product.specifications || null,
            discount: product.discount_amount || 0,
            originalPrice: product.original_price || null,
          };
        })
        .filter((item) => item !== null);
      console.log("🛒 Transformed cart items:", transformedItems);
      setCartItems(transformedItems);
    } catch (error) {
      console.log(
        "🛒 Cart API not available, using localStorage fallback:",
        error.message,
      );

      // If it's an authentication error, clear the token and redirect to login
      if (error.message.includes("Authentication failed")) {
        console.log("🛒 Authentication failed, clearing session");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setCartItems([]);
        return;
      }

      // Fallback to localStorage cart
      const saved = localStorage.getItem("cart");
      if (saved) {
        try {
          const cartData = JSON.parse(saved);
          console.log("Using localStorage cart:", cartData);

          // Clean old dirty data
          const cleaned = cartData.map((item) => ({
            ...item,
            category: normalizeCategory(item.category),
          }));

          console.log("Cleaned localStorage cart:", cleaned);
          setCartItems(cleaned);
        } catch (parseError) {
          console.error("Error parsing localStorage cart:", parseError);
          setCartItems([]);
        }
      } else {
        console.log("No cart data in localStorage, starting with empty cart");
        setCartItems([]);
      }
    }
  };
  const loadWishlistFromAPI = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, using localStorage only");
        const saved = localStorage.getItem("wishlist");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Clean old dirty data
          const cleaned = parsed.map((item) => ({
            ...item,
            category: normalizeCategory(item.category),
          }));
          setWishlist(cleaned);
        } else {
          setWishlist([]);
        }
        return;
      }
      // Get local wishlist first
      const localWishlist = (() => {
        const saved = localStorage.getItem("wishlist");
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {
            console.error("Error parsing local wishlist:", e);
            return [];
          }
        }
        return [];
      })();

      // Try the user-specific API endpoint first
      const res = await robustFetch("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("❤️ Raw wishlist API response:", data);

      // Extract and transform product data from wishlist items
      const wishlistProducts =
        data?.data
          ?.map((item, index) => {
            console.log(`❤️ Processing wishlist item ${index}:`, item);

            // Handle both wrapped and unwrapped product data
            let product = item.product;
            let isWrapped = true;

            // If no product property, item itself is the product
            if (!product) {
              product = item;
              isWrapped = false;
            }

            if (!product) {
              console.warn(
                `❤️ Wishlist item ${index} missing product data:`,
                item,
              );
              return null;
            }
            if (!product._id) {
              console.warn(`❤️ Product missing _id:`, product);
            }

            return {
              id: product._id,
              _id: product._id,
              name:
                product.name || product.product_name_en || "Unknown Product",
              price: product.price || product.unit_price || 0,
              unit_price: product.price || product.unit_price || 0,
              thumbnail:
                product.thumbnail ||
                (product.images && product.images[0]) ||
                product.image ||
                null,
              image:
                product.image ||
                product.thumbnail ||
                (product.images && product.images[0]) ||
                null,
              images: product.images || [],
              stock: product.stock || product.stock || 0,
              stock: product.stock || 0,
              inStock: (product.stock || product.stock || 0) > 0,
              sku: product.sku || "",
              description: product.description || product.description_en || "",
              category: normalizeCategory(product.category),
              discount_amount: product.discount_amount || 0,
            };
          })
          .filter((item) => item !== null) || [];

      console.log(
        "❤️ Transformed wishlist products from API:",
        wishlistProducts,
      );

      // Merge API wishlist with local wishlist to preserve locally added items
      const mergedWishlist = [
        ...wishlistProducts,
        ...localWishlist.filter(
          (localItem) =>
            !wishlistProducts.some(
              (apiItem) =>
                apiItem._id === localItem._id || apiItem.id === localItem.id,
            ),
        ),
      ];

      console.log(
        "❤️ Merged wishlist (API + local):",
        mergedWishlist.length,
        "items",
      );
      setWishlist(mergedWishlist);
      localStorage.setItem("wishlist", JSON.stringify(mergedWishlist));
      console.log(
        "❤️ Wishlist loaded from API and merged with local:",
        mergedWishlist.length,
        "items",
      );
    } catch (err) {
      console.log(
        "❤️ Wishlist API not available, using localStorage fallback:",
        err.message,
      );

      // If it's an authentication error, clear the token
      if (err.message.includes("Authentication failed")) {
        console.log("❤️ Authentication failed, clearing session");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setWishlist([]);
        return;
      }

      const saved = localStorage.getItem("wishlist");
      if (saved) {
        try {
          const wishlistData = JSON.parse(saved);
          console.log("Using localStorage wishlist:", wishlistData);

          // Clean old dirty data
          const cleaned = wishlistData.map((item) => ({
            ...item,
            category: normalizeCategory(item.category),
          }));

          console.log("Cleaned localStorage wishlist:", cleaned);
          setWishlist(cleaned);
        } catch (parseError) {
          console.error("Error parsing localStorage wishlist:", parseError);
          setWishlist([]);
        }
      } else {
        console.log(
          "No wishlist data in localStorage, starting with empty wishlist",
        );
        setWishlist([]);
      }
    }
  };
  useEffect(() => {
    console.log("🛒 Cart state changed, saving to localStorage:", cartItems);
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    console.log("❤️ Wishlist state changed, saving to localStorage:", wishlist);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);
  const getTotalItems = () => {
    if (!Array.isArray(cartItems)) {
      console.log("🛒 cartItems is not an array:", cartItems);
      return 0;
    }
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };
  const getTotalPrice = () => {
    if (!Array.isArray(cartItems)) {
      return 0;
    }
    return cartItems.reduce(
      (total, item) =>
        total + (item.quantity || 0) * (item.price || item.unit_price || 0),
      0,
    );
  };
  const removeFromCart = async (itemId, color = null, size = null) => {
    try {
      // Step 1: Find the cart item with this productId to get cartItemId
      const cartItem = cartItems.find(
        (item) =>
          item.id === itemId ||
          item._id === itemId ||
          item.productId === itemId,
      );
      if (!cartItem) {
        return {
          success: false,
          message: "Item not found in cart",
        };
      }
      console.log("🛒 Removing cart item:", {
        productId: itemId,
        cartItemId: cartItem.cartItemId,
      });

      // Step 2: Try backend API first (if available)
      try {
        const token = localStorage.getItem("token");
        const res = await robustFetch(`/cart/items/${cartItem.cartItemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("🛒 Backend remove success:", await res.json());
      } catch (apiError) {
        console.log(
          "🛒 Backend remove failed, using localStorage only:",
          apiError.message,
        );
        // Continue with localStorage update
      }

      // Step 3: Update local state (always do this)
      setCartItems((prev) =>
        prev.filter((item) => item.id !== itemId && item._id !== itemId),
      );
      return { success: true };
    } catch (error) {
      console.error("🛒 Remove from cart failed:", error.message);
      return {
        success: false,
        message: "Failed to remove item from cart",
      };
    }
  };
  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return await removeFromCart(itemId);
    } else {
      // Update local state immediately for responsiveness
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId || item._id === itemId || item.productId === itemId
            ? {
                ...item,
                quantity,
                totalPrice: quantity * (item.price || item.unit_price || 0),
              }
            : item,
        ),
      );

      // Then try to update backend (if available)
      try {
        const cartItem = cartItems.find(
          (item) =>
            item.id === itemId ||
            item._id === itemId ||
            item.productId === itemId,
        );
        if (cartItem && cartItem.productId) {
          // Backend expects productId in body, not cartItemId
          const payload = {
            productId: cartItem.productId, // ✅ Send productId, not cartItemId
            quantity: quantity,
          };
          console.log("🛒 Sending update payload:", payload);
          console.log("🛒 Cart item ID:", cartItem.cartItemId);
          console.log("🛒 Product ID:", cartItem.productId);

          const token = localStorage.getItem("token");
          const res = await robustFetch(`/cart/items/${cartItem.cartItemId}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          console.log("🛒 Backend update quantity success:", data);
        }
      } catch (error) {
        console.log(
          "🛒 Backend update quantity failed, using localStorage only:",
          error.message,
        );
        // Local state is already updated, so continue
      }
      return { success: true };
    }
  };
  const clearCart = useCallback(async () => {
    try {
      setCartItems([]);

      // Try to clear backend cart (if available)
      let retries = 1; // Only 1 retry to avoid excessive loops
      let success = false;

      while (retries > 0 && !success) {
        try {
          const token = localStorage.getItem("token");
          const res = await robustFetch("/cart/clear", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("🛒 Backend clear cart result:", await res.json());
          success = true;
        } catch (apiError) {
          console.log(
            `🛒 Backend clear cart failed (attempt ${2 - retries}/1):`,
            apiError.message,
          );
          retries--;

          if (retries > 0) {
            // Wait 1 second before retry
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            console.log(
              "🛒 Backend clear cart failed, but local state cleared - API may be unavailable",
            );
          }
        }
      }
      return { success: true };
    } catch (error) {
      console.error("Error clearing cart:", error);
      return { success: false, error: error.message };
    }
  }, []);
  const addToCart = async (product, quantity = 1) => {
    try {
      console.log("🛒 Adding to cart - Full product object:", product);
      console.log("🛒 Adding to cart - product._id:", product._id);
      console.log("🛒 Adding to cart - product.id:", product.id);
      console.log("🛒 Adding to cart - productId to send:", product._id);
      if (!product._id) {
        return {
          success: false,
          message: "Product ID is missing",
        };
      }

      // 🔒 STOCK BLOCKING: Don't allow adding out-of-stock items
      const productStock = product.stock || 0;

      if (productStock <= 0) {
        console.error(`🚫 BLOCKED: "${product.name}" is OUT OF STOCK`);
        return {
          success: false,
          message: `"${product.name}" is currently out of stock and cannot be added to cart`,
          blocked: true,
        };
      }

      // 🔒 Don't exceed available stock
      if (quantity > productStock) {
        console.error(
          `🚫 BLOCKED: Only ${productStock} units of "${product.name}" available, requested ${quantity}`,
        );
        return {
          success: false,
          message: `Only ${productStock} units of "${product.name}" are available`,
          maxStock: productStock,
        };
      }

      // ⚠️ LOW STOCK WARNING
      if (productStock <= 3) {
        console.warn(
          `⚠️ LOW STOCK WARNING: "${product.name}" - Only ${productStock} units remaining`,
        );
      }

      console.log("Final productId:", product._id);
      console.log("Quantity:", quantity);

      // Step 1: Update local state immediately for responsiveness
      const normalizedProduct = {
        ...product,
        _id: product._id, // ensure exists
        cartItemId: `local-${Date.now()}`, // Temporary ID for localStorage
        quantity,
        // ✅ ENSURE STOCK IS ALWAYS INCLUDED FOR CHECKOUT VALIDATION
        stock: productStock,
      };

      setCartItems((prev) => {
        const existingItem = prev.find((item) => item._id === product._id);

        if (existingItem) {
          // Update quantity if item exists
          return prev.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        } else {
          // Add new item if it doesn't exist
          return [...prev, normalizedProduct];
        }
      });

      // Step 2: Try to sync with backend API (if available)
      try {
        const payload = {
          productId: product._id,
          quantity: quantity,
        };
        console.log("🛒 Add to Cart Payload:", payload);

        const token = localStorage.getItem("token");
        const res = await robustFetch("/cart/add", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        console.log("🛒 Add to cart response from API:", data);

        // Don't reload cart immediately - let localStorage sync work
        // The item is already in local state, localStorage will save it
        // Only reload if the API returns updated cart data we should use
        if (data.success && data.data && data.data.items) {
          console.log("🛒 API returned cart data, syncing...");
          // Transform API response to match local format
          const apiCartItems = data.data.items.map((item) => {
            const product = item.product;
            return {
              cartItemId: item._id,
              productId: product._id,
              id: product._id,
              _id: product._id,
              name: product.name || product.product_name_en || "Product",
              description:
                product.description ||
                product.description_en ||
                "No description available",
              price: item.price || product.price || product.unit_price || 0,
              unit_price:
                item.price || product.price || product.unit_price || 0,
              quantity: item.quantity || 1,
              thumbnail:
                product.thumbnail ||
                (product.images && product.images[0]) ||
                product.image ||
                null,
              image: product.image || product.thumbnail || null,
              images: product.images || [],
              sku: product.sku || "N/A",
              stock: product.stock || product.stock || 0,
              category: normalizeCategory(product.category),
              specifications: product.specifications || null,
              discount: product.discount_amount || 0,
              originalPrice: product.original_price || null,
            };
          });
          setCartItems(apiCartItems);
        } else {
          console.log("🛒 API didn't return cart data, keeping local state");
        }
      } catch (apiError) {
        console.log(
          "🛒 Backend add to cart failed, using localStorage only:",
          apiError.message,
        );
        // Local state is already updated, so continue
      }

      return { success: true };
    } catch (error) {
      console.error("🛒 Add to cart error:", error);
      console.error("🛒 Error message:", error.message);

      // Handle error responses
      let errorMessage = "Failed to add item to cart";
      if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  };
  const isInCart = (productId) => {
    return cartItems.some((item) => item._id === productId);
  };
  const addToWishlist = async (product) => {
    try {
      const token = localStorage.getItem("token");
      // Update local state first for immediate UI feedback
      let wasAdded = false;
      setWishlist((prev) => {
        const exists = prev.some(
          (item) => item.id === product.id || item._id === product._id,
        );
        if (exists) return prev;
        wasAdded = true;

        // Normalize product stock information
        const stockValue =
          product.stock ?? product.stock ?? product.stockQuantity ?? 0;
        const normalizedProduct = {
          ...product,
          stock: stockValue,
          // Determine if product is in stock:
          // - If stock > 0, definitely in stock
          // - If stock === 0 but status is 'active', treat as available
          // - If stock === 0 and status is 'out_of_stock' or 'inactive', then truly out of stock
          inStock:
            stockValue > 0 ||
            (product.status !== "out_of_stock" &&
              product.status !== "inactive"),
        };
        const newWishlist = [...prev, normalizedProduct];
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
        return newWishlist;
      });
      if (!wasAdded) {
        console.log("❤️ Product already in wishlist");
        return { success: true, message: "Already in wishlist" };
      }
      // Sync with backend if authenticated
      if (token) {
        try {
          await robustFetch("/wishlist/add", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: product._id || product.id,
            }),
          });
          console.log("❤️ Synced with MongoDB Atlas");
        } catch (apiError) {
          console.log(
            "❤️ API sync failed, but local state updated:",
            apiError.response?.data?.error || apiError.message,
          );
        }
      }
      console.log("❤️ Added to wishlist successfully");
      return { success: true };
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      return { success: false, error: error.message };
    }
  };
  const removeFromWishlist = async (productId) => {
    try {
      // Update local state
      const newWishlist = wishlist.filter(
        (item) => item.id !== productId && item._id !== productId,
      );
      setWishlist(newWishlist);
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      console.log("❤️ Removed from wishlist (localStorage)");

      // Sync with backend if authenticated
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await robustFetch("/wishlist/remove", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: productId,
            }),
          });
          console.log("❤️ Synced removal with backend (MongoDB Atlas)");
        } catch (apiError) {
          console.log(
            "❤️ Backend sync failed for removal, but local state updated:",
            apiError.response?.data?.error || apiError.message,
          );
          // Continue - local state is already updated
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      return { success: false, error: error.message };
    }
  };
  const isInWishlist = (productId) => {
    return wishlist.some(
      (item) => item.id === productId || item._id === productId,
    );
  };
  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        wishlist,
        getTotalItems,
        getTotalPrice,
        removeFromCart,
        updateQuantity,
        clearCart,
        addToCart,
        isInCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        cart: cartItems, // Alias for compatibility
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);
