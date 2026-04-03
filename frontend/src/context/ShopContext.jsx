import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "$"; // Change the currency symbol here
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  // Initialize token from localStorage immediately to prevent redirect on refresh
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");
  const navigate = useNavigate();

  // Add item to cart
  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select product size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);
    toast.success(
      <div className="flex items-center justify-between gap-4">
        <span>Item added to cart</span>
        <button
          onClick={() => navigate("/cart")}
          className="bg-black text-white text-xs px-4 py-1.5 rounded hover:bg-gray-800 transition-colors font-medium"
        >
          View Cart
        </button>
      </div>,
      {
        autoClose: 3000,
      }
    );

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Calculate total cart count
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalCount += cartItems[items][item];
        }
      }
    }
    return totalCount;
  };

  // Update item quantity in cart
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
    toast.success("Cart updated");

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Calculate total cart amount (use finalPrice if sale is applied)
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (!itemInfo) continue;
      const priceToUse = itemInfo.finalPrice && itemInfo.saleApplied 
        ? itemInfo.finalPrice 
        : itemInfo.price;
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalAmount += priceToUse * cartItems[items][item];
        }
      }
    }
    return totalAmount;
  };

  // Fetch products from backend
  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        params: { _: Date.now() } // Add cache busting
      });
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  // Fetch user cart from backend
  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete item from cart
  const deleteFromCart = async (itemId, size) => {
    let cartData = structuredClone(cartItems);

    if (cartData[itemId] && cartData[itemId][size]) {
      delete cartData[itemId][size];

      // Remove the product if no sizes remain
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    }

    setCartItems(cartData);
    toast.success("Item removed from cart");

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/delete",
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Fetch products when component mounts and periodically refresh
  useEffect(() => {
    getProductsData();
    
    // Refresh products every 30 seconds to catch sale status changes
    const interval = setInterval(() => {
      getProductsData();
    }, 30000);
    
    // Refresh products when window regains focus
    const handleFocus = () => {
      getProductsData();
    };
    window.addEventListener('focus', handleFocus);
    
    // Refresh products when sale status changes
    const handleSaleStatusChange = (event) => {
      console.log('Sale status changed event received:', event.detail);
      // Force immediate refresh with cache busting
      getProductsData();
      // Also trigger a re-render by updating products state
      setTimeout(() => {
        getProductsData();
      }, 500);
    };
    window.addEventListener('saleStatusChanged', handleSaleStatusChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('saleStatusChanged', handleSaleStatusChange);
    };
  }, []);

  // Fetch cart data when token is available
  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      getUserCart(localStorage.getItem("token"));
    }
    // Load user name from localStorage
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [token]);

  // Context value
  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    deleteFromCart,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    userName,
    setUserName,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
