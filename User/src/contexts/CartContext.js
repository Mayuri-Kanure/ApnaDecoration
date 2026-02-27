import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Get authentication state
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Handle authentication state changes
  useEffect(() => {
    console.log('🛒 CartContext - Authentication state changed:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('🛒 CartContext - User logged out, clearing cart only');
      setCartItems([]); // Clear cart when user logs out
      // Don't clear wishlist - keep it in localStorage
    } else {
      console.log('🛒 CartContext - User logged in, loading cart and wishlist');
      loadCartFromAPI(); // Load cart when user logs in
      loadWishlistFromAPI(); // Load wishlist from API
    }
  }, [isAuthenticated]);

  const loadCartFromAPI = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartItems([]);
      return;
    }
    try {
      const res = await api.get("/api/cart");
      const rawCartItems = res.data?.data?.items || []; 
      // Transform cart items to flatten product data
      const transformedItems = rawCartItems.map(item => {
        const product = item.product;
        if (!product) {
          console.warn('Cart item missing product data:', item);
          return null;
        } 
        return {
          cartItemId: item._id,
          productId: product._id,
          id: product._id,
          _id: product._id,
          name: product.name || product.product_name_en || 'Product',
          description: product.description || product.description_en || 'No description available',
          price: item.price || product.price || product.unit_price || 0,
          unit_price: item.price || product.price || product.unit_price || 0,
          quantity: item.quantity || 1,
          thumbnail: product.thumbnail || (product.images && product.images[0]) || null,
          images: product.images || [],
          sku: product.sku || 'N/A',
          stock: product.stock || product.stock_qty || 0,
          category: product.category || null,
          specifications: product.specifications || null,
          discount: product.discount_amount || 0,
          originalPrice: product.original_price || null
        };
      }).filter(item => item !== null);
      console.log('🛒 Transformed cart items:', transformedItems);
      setCartItems(transformedItems);
    } catch (error) {
      console.error('Error loading cart from API:', error);
    }
  };
  const loadWishlistFromAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("❤️ No token found, using localStorage only");
        const saved = localStorage.getItem('wishlist');
        setWishlist(saved ? JSON.parse(saved) : []);
        return;
      }
      const res = await api.get("/api/wishlist");
      // Extract and transform product data from wishlist items
      const wishlistProducts = res.data?.data?.map(item => {
        const product = item.product;
        return {
          id: product._id,
          _id: product._id,
          name: product.name || product.product_name_en || 'Unknown Product',
          price: product.price || product.unit_price || 0,
          unit_price: product.price || product.unit_price || 0,
          thumbnail: product.thumbnail || null,
          image: product.image || product.thumbnail || null,
          images: product.images || [],
          stock: product.stock || product.stock_qty || 0,
          stock_qty: product.stock || product.stock_qty || 0,
          inStock: (product.stock || product.stock_qty || 0) > 0,
          sku: product.sku || '',
          description: product.description || product.description_en || '',
          category: product.category || null,
          discount_amount: product.discount_amount || 0
        };
      }) || []; 
      setWishlist(wishlistProducts);
      localStorage.setItem('wishlist', JSON.stringify(wishlistProducts));
      console.log('❤️ Wishlist loaded from API:', wishlistProducts.length, 'items');
    } catch (err) {
      console.log("❤️ API failed, using localStorage fallback");
      const saved = localStorage.getItem('wishlist');
      setWishlist(saved ? JSON.parse(saved) : []);
    }
  };
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);
  const getTotalItems = () => {
    if (!Array.isArray(cartItems)) {
      console.log('🛒 cartItems is not an array:', cartItems);
      return 0;
    }
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };
  const getTotalPrice = () => {
    if (!Array.isArray(cartItems)) {
      return 0;
    }
    return cartItems.reduce((total, item) => total + ((item.quantity || 0) * (item.price || item.unit_price || 0)), 0);
  };
  const removeFromCart = async (itemId, color = null, size = null) => {
    try {
      // Step 1: Find the cart item with this productId to get cartItemId
      const cartItem = cartItems.find(item => 
        item.id === itemId || item._id === itemId || item.productId === itemId
      );
      if (!cartItem) {
        return {
          success: false,
          message: 'Item not found in cart'
        };
      }
      console.log('🛒 Removing cart item:', {
        productId: itemId,
        cartItemId: cartItem.cartItemId
      });
      // Step 2: Call backend API with cartItemId
      const res = await api.delete(`/api/cart/items/${cartItem.cartItemId}`);
      console.log('🛒 Backend remove success:', res.data);

      // Step 3: Reload cart from backend after successful deletion
      await loadCartFromAPI(true);
      return { success: true };
    } catch (error) {
      console.error('🛒 Backend remove failed:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item from cart'
      };
    }
  };
  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return await removeFromCart(itemId);
    } else {
      // Update local state immediately for responsiveness
      setCartItems(prev => 
        prev.map(item => 
          (item.id === itemId || item._id === itemId || item.productId === itemId)
            ? { ...item, quantity, totalPrice: quantity * (item.price || item.unit_price || 0) }
            : item
        )
      );
      // Then update backend and reload to get latest data
      try {
        const cartItem = cartItems.find(item => 
          item.id === itemId || item._id === itemId || item.productId === itemId
        );
        if (cartItem && cartItem.productId) {
          // Backend expects productId in body, not cartItemId
          const payload = {
            productId: cartItem.productId,  // ✅ Send productId, not cartItemId
            quantity: quantity
          };
          console.log('🛒 Sending update payload:', payload);
          console.log('🛒 Cart item ID:', cartItem.cartItemId);
          console.log('🛒 Product ID:', cartItem.productId);
          
          const res = await api.put(`/api/cart/items/${cartItem.cartItemId}`, payload);
          console.log('🛒 Backend update quantity success:', res.data);
          
          // Reload cart from backend to get latest data
          await loadCartFromAPI(true);
        }
      } catch (error) {
        console.error('🛒 Backend update quantity failed:', error);
        console.error('🛒 Error response data:', error.response?.data);
        console.error('🛒 Error status:', error.response?.status);
        console.error('🛒 Error message:', error.response?.data?.message); 
        // Revert to previous state if backend fails
        await loadCartFromAPI(true);
      }  
      return { success: true };
    }
  };
  const clearCart = async () => {
    try {
      setCartItems([]); 
      // Call backend API to clear cart
      try {
        const res = await api.delete('/api/cart/clear');
        console.log('🛒 Backend clear cart result:', res.data);
      } catch (apiError) {
        console.log('🛒 Backend clear cart failed, but local state updated:', apiError);
        // Don't fail the operation if backend fails - local state is already updated
      }
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  };
  const addToCart = async (product, quantity = 1) => {
    try {
      console.log('🛒 Adding to cart - Full product object:', product);
      console.log('🛒 Adding to cart - product._id:', product._id);
      console.log('🛒 Adding to cart - product.id:', product.id);
      console.log('🛒 Adding to cart - productId to send:', product._id || product.id);
      const productId = product._id || product.id;  
      if (!productId) {
        return {
          success: false,
          message: 'Product ID is missing'
        };
      }
      console.log('🛒 Final productId:', productId);
      console.log('🛒 Quantity:', quantity);  
      // Debug payload before sending
      const payload = {
        productId: productId,
        quantity: quantity
      };
      console.log('🛒 Add to Cart Payload:', payload);  
      // Call backend API to add to cart
      const res = await api.post("/api/cart/add", payload); 
      console.log('🛒 Add to cart response:', res);
      // Force refresh cart from backend after adding item
      await loadCartFromAPI(true); // Force reload
      return { success: true };
    } catch (error) {
      console.error('🛒 Add to cart error:', error);
      console.error('🛒 Error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to add item to cart'
      };
    }
  };
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId || item._id === productId);
  };
  const addToWishlist = async (product) => {
    try {
      const token = localStorage.getItem('token');
      // Update local state first for immediate UI feedback
      let wasAdded = false;
      setWishlist(prev => {
        const exists = prev.some(item => item.id === product.id || item._id === product._id);
        if (exists) return prev;
        wasAdded = true;
        const newWishlist = [...prev, product];
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return newWishlist;
      });  
      if (!wasAdded) {
        console.log('❤️ Product already in wishlist');
        return { success: true, message: 'Already in wishlist' };
      }  
      // Sync with backend if authenticated
      if (token) {
        try {
          await api.post('/api/wishlist/add', { productId: product._id || product.id });
          console.log('❤️ Synced with MongoDB Atlas');
        } catch (apiError) {
          console.log('❤️ API sync failed, but local state updated:', apiError.response?.data?.error || apiError.message);
        }
      }
      console.log('❤️ Added to wishlist successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      return { success: false, error: error.message };
    }
  };
  const removeFromWishlist = async (productId) => {
    try {
      // Update local state
      const newWishlist = wishlist.filter(item => item.id !== productId && item._id !== productId);
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      console.log('❤️ Removed from wishlist (localStorage)');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      return { success: false, error: error.message };
    }
  };
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId || item._id === productId);
  };
  return (
    <CartContext.Provider value={{ 
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
      cart: cartItems // Alias for compatibility
    }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);
