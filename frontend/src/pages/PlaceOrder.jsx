import React, { useContext, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const CHECKOUT_FORM_KEY = "checkoutFormData";

const defaultFormData = () => ({
  firstName: "",
  lastName: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  phone: "",
});

const getRestoredFormData = () => {
  try {
    const s = localStorage.getItem(CHECKOUT_FORM_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      return { ...defaultFormData(), ...parsed };
    }
  } catch (_) {}
  return defaultFormData();
};

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);
  const [formData, setFormData] = useState(getRestoredFormData);
  const [errors, setErrors] = useState({});

  // Auto-save form to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CHECKOUT_FORM_KEY, JSON.stringify(formData));
  }, [formData]);

  const clearCheckoutFormData = () => {
    try {
      localStorage.removeItem(CHECKOUT_FORM_KEY);
    } catch (_) {}
  };

  // Pre-fill phone from user profile (if available)
  useEffect(() => {
    const fetchProfilePhone = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { token },
        });
        if (response.data.success && response.data.user?.phone) {
          // Pre-fill phone from profile, but allow user to edit
          setFormData((prev) => ({
            ...prev,
            phone: response.data.user.phone,
          }));
        }
        // Pre-fill email from profile if available
        if (response.data.success && response.data.user?.email) {
          setFormData((prev) => ({
            ...prev,
            email: response.data.user.email,
          }));
        }
      } catch (error) {
        // Silently fail - user can enter manually
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfilePhone();
  }, [token, backendUrl]);

  // Validation functions
  const validateFirstName = (value) => {
    if (!value.trim()) return "First name is required";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "First name can only contain letters and spaces";
    return "";
  };

  const validateLastName = (value) => {
    if (value && !/^[a-zA-Z\s]+$/.test(value)) {
      return "Last name can only contain letters and spaces";
    }
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(value)) return "Email must be a valid @gmail.com address";
    return "";
  };

  const validateCity = (value) => {
    if (!value.trim()) return "City is required";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "City can only contain letters and spaces";
    return "";
  };

  const validateState = (value) => {
    if (!value.trim()) return "State is required";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "State can only contain letters and spaces";
    return "";
  };

  const validateZipcode = (value) => {
    if (!value.trim()) return "Zipcode is required";
    if (!/^\d+$/.test(value)) return "Zipcode must contain only numbers";
    return "";
  };

  const validateCountry = (value) => {
    if (!value.trim()) return "Country is required";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Country can only contain letters and spaces";
    return "";
  };

  const validatePhone = (value) => {
    if (!value.trim()) return "Phone number is required";
    if (!/^\d{10}$/.test(value)) return "Phone number must be exactly 10 digits";
    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return validateFirstName(value);
      case "lastName":
        return validateLastName(value);
      case "email":
        return validateEmail(value);
      case "street":
        return !value.trim() ? "Street is required" : "";
      case "city":
        return validateCity(value);
      case "state":
        return validateState(value);
      case "zipcode":
        return validateZipcode(value);
      case "country":
        return validateCountry(value);
      case "phone":
        return validatePhone(value);
      default:
        return "";
    }
  };

  const onChangeHandler = (event) => {
    const name = event.target.name;
    let value = event.target.value;

    // Only allow numbers for phone and zipcode fields
    if (name === "phone" || name === "zipcode") {
      value = value.replace(/[^0-9]/g, "");
    }
    // Truncate phone to 10 digits
    if (name === "phone") {
      value = value.slice(0, 10);
    }
    // For alphabets-only fields, remove numbers and special chars (except spaces)
    if (name === "firstName" || name === "lastName" || name === "city" || name === "state" || name === "country") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setFormData((data) => ({ ...data, [name]: value }));

    // Validate on change and clear error if valid
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Order Payment",
      descritpion: "Order Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);
        try {
          const { data } = await axios.post(
            backendUrl + "/api/order/verifyRazorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            clearCheckoutFormData();
            navigate("/orders");
            setCartItems({});
          }
        } catch (error) {
          console.log(error);
          toast.error(error);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validate all fields
    const newErrors = {};
    newErrors.firstName = validateFirstName(formData.firstName);
    newErrors.lastName = validateLastName(formData.lastName);
    newErrors.email = validateEmail(formData.email);
    newErrors.street = !formData.street.trim() ? "Street is required" : "";
    newErrors.city = validateCity(formData.city);
    newErrors.state = validateState(formData.state);
    newErrors.zipcode = validateZipcode(formData.zipcode);
    newErrors.country = validateCountry(formData.country);
    newErrors.phone = validatePhone(formData.phone);

    setErrors(newErrors);

    // Check if any errors exist
    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      // Debugging form data before submission
      console.log("Form Data:", formData);

      // Debugging cartItems and products to ensure data is present
      console.log("Cart Items:", cartItems);
      console.log("Products:", products);

      let orderItems = [];

      for (const items in cartItems) {
        console.log("Current Item Key (Size):", items); // Debugging current item key (size)
        for (const item in cartItems[items]) {
          console.log(
            `Item Size: ${item}, Quantity: ${cartItems[items][item]}`
          ); // Debugging item size and quantity
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            ); // Use correct _id match here
            console.log("Item Info:", itemInfo); // Debugging item info
            if (itemInfo) {
              itemInfo.size = item; // Handle size separately
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            } else {
              console.log("Item not found in products list:", item); // Debugging missing items
            }
          }
        }
      }

      // Debugging final orderItems array
      console.log("Final Order Items Array:", orderItems);

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        paymentMethod: method,
      };

      console.log(orderData);

      // Choose the different payment methods
      switch (method) {
        // API calls for COD
        case "cod":
          const response = await axios.post(
            backendUrl + "/api/order/place",
            orderData,
            { headers: { token } }
          );
          // console.log(response.data);
          if (response.data.success) {
            clearCheckoutFormData();
            setCartItems({});
            navigate("/orders");
          } else {
            toast.error(response.data.message);
          }
          break;

        case "stripe":
          const responseStripe = await axios.post(
            backendUrl + "/api/order/stripe",
            orderData,
            { headers: { token } }
          );
          if (responseStripe.data.success) {
            clearCheckoutFormData();
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
            toast.success(responseStripe.data.message);
          } else {
            toast.error(responseStripe.data.message);
          }
          break;
        case "razorpay":
          const responseRazorpay = await axios.post(
            backendUrl + "/api/order/razorpay",
            orderData,
            { headers: { token } }
          );
          if (responseRazorpay.data.success) {
            initPay(responseRazorpay.data.order);
          }

          break;

        default:
          break;
      }
    } catch (error) {
      // Debugging errors
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* Left Side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <div className="w-full">
            <input
              required
              onChange={onChangeHandler}
              name="firstName"
              value={formData.firstName}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="First Name *"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="w-full">
            <input
              onChange={onChangeHandler}
              name="lastName"
              value={formData.lastName}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="Last Name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        <div>
          <input
            required
            onChange={onChangeHandler}
            name="email"
            value={formData.email}
            className={`border rounded py-1.5 px-3.5 w-full ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            type="email"
            placeholder="Email Address * (@gmail.com)"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <input
            required
            onChange={onChangeHandler}
            name="street"
            value={formData.street}
            className={`border rounded py-1.5 px-3.5 w-full ${
              errors.street ? "border-red-500" : "border-gray-300"
            }`}
            type="text"
            placeholder="Street *"
          />
          {errors.street && (
            <p className="text-red-500 text-xs mt-1">{errors.street}</p>
          )}
        </div>
        <div className="flex gap-3">
          <div className="w-full">
            <input
              required
              onChange={onChangeHandler}
              name="city"
              value={formData.city}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="City *"
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>
          <div className="w-full">
            <input
              required
              onChange={onChangeHandler}
              name="state"
              value={formData.state}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.state ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="State *"
            />
            {errors.state && (
              <p className="text-red-500 text-xs mt-1">{errors.state}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-full">
            <input
              required
              onChange={onChangeHandler}
              name="zipcode"
              value={formData.zipcode}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.zipcode ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Zipcode *"
            />
            {errors.zipcode && (
              <p className="text-red-500 text-xs mt-1">{errors.zipcode}</p>
            )}
          </div>
          <div className="w-full">
            <input
              required
              onChange={onChangeHandler}
              name="country"
              value={formData.country}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.country ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="Country *"
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>
        </div>
        <div>
          <input
            required
            onChange={onChangeHandler}
            name="phone"
            value={formData.phone}
            className={`border rounded py-1.5 px-3.5 w-full ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Phone * (10 digits)"
            maxLength={10}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/* Payment Method Selection */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod("stripe")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-[14px] h-[14px] border rounded-full ${
                  method === "stripe" ? "bg-green-400" : ""
                }`}
              ></p>
              <img className="h-5 mx-4" src={assets.stripe_icon} alt="Stripe" />
            </div>
            <div
              onClick={() => setMethod("razorpay")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-[14px] h-[14px] border rounded-full ${
                  method === "razorpay" ? "bg-green-400" : ""
                }`}
              ></p>
              <img
                className="h-5 mx-4"
                src={assets.razorpay_logo}
                alt="Razorpay"
              />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-[14px] h-[14px] border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
