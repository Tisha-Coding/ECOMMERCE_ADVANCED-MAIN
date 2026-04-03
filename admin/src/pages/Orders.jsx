import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";

const formatPrice = (amount) =>
  `${currency}${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusStyles = (status) => {
    const normalizedStatus = String(status || "").trim().toUpperCase();
    switch (normalizedStatus) {
      case "ORDER PLACED":
      case "PACKING":
        return "bg-amber-50 text-amber-800 border border-amber-200";
      case "SHIPPED":
      case "OUT FOR DELIVERY":
        return "bg-sky-50 text-sky-800 border border-sky-200";
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-800 border border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const customerName = `${order.address.firstName} ${order.address.lastName}`.toLowerCase();
    const phone = order.address.phone?.toLowerCase() || "";
    const orderId = order._id?.toLowerCase() || "";
    return (
      customerName.includes(query) ||
      phone.includes(query) ||
      orderId.includes(query) ||
      order.items.some((item) => item.name.toLowerCase().includes(query))
    );
  });

  const fetchAllOrders = async () => {
    if (!token) return null;

    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;

    // Optimistically update the status locally
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );

    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order status updated successfully");
        await fetchAllOrders(); // Refresh orders list
      } else {
        toast.error(response.data.message || "Could not update status. Please try again.");
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Could not update status. Please try again.");
      await fetchAllOrders();
    }
  };

  useEffect(() => {
    fetchAllOrders(); // Correctly invoke fetchAllOrders
  }, [token]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-xl font-medium">Order Page</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or order ID..."
            className="border border-gray-300 px-3 py-2 rounded text-sm w-full sm:w-64 focus:outline-none focus:border-black"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-600 hover:text-black text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-gray-600">
          <p className="text-lg font-medium mb-2">
            {searchQuery ? "No orders found" : "No orders yet"}
          </p>
          <p className="text-sm">
            {searchQuery
              ? "Try adjusting your search query."
              : "Orders will appear here once customers place them."}
          </p>
        </div>
      ) : (
        <div>
          {filteredOrders.map((order, index) => (
          <div
            className="grid grid-cols-1 lg:grid-cols-[80px_2fr_1fr_120px_180px] gap-4 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 bg-white rounded-lg shadow-sm"
            key={index}
          >
            <img className="w-12 h-12 object-contain" src={assets.parcel_icon} alt="Order Icon" />
            
            {/* Products & Customer Info */}
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Products:</p>
                {order.items.map((item, itemIndex) => (
                  <div className="py-1 text-gray-700" key={itemIndex}>
                    <p className="font-medium">{item.name} x {item.quantity} ({item.size})</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.finalPrice && item.saleApplied && item.finalPrice !== item.price ? (
                        <>
                          <span className="text-gray-900 font-medium">
                            {currency}{Number(item.finalPrice).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-gray-400 line-through text-xs">
                            {currency}{Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </span>
                          {item.saleDiscountPercentage > 0 && (
                            <span className="bg-red-100 text-red-700 text-xs font-medium px-1.5 py-0.5 rounded">
                              {item.saleDiscountPercentage}% OFF
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-700">
                          {currency}{Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">
                        (Total: {currency}{Number((item.finalPrice && item.saleApplied ? item.finalPrice : item.price) * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })})
                      </span>
                    </div>
                    {itemIndex !== order.items.length - 1 && <span className="hidden">,</span>}
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3">
                <p className="font-semibold text-gray-900 mb-2">Customer Name:</p>
                <p className="text-gray-700 font-medium">
                  {order.address.firstName + " " + order.address.lastName}
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-2">Address:</p>
                <p className="text-gray-700">{order.address.street}</p>
                <p className="text-gray-700">
                  {order.address.city + ", " + order.address.state}
                </p>
                <p className="text-gray-700">
                  {order.address.country + " - " + order.address.zipcode}
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-1">Phone:</p>
                <p className="text-gray-700">{order.address.phone}</p>
              </div>
              
              {order.address.email && (
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Email:</p>
                  <p className="text-gray-700">{order.address.email}</p>
                </div>
              )}
            </div>
            
            {/* Order Details */}
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Total Items:</p>
                <p className="text-gray-700">{order.items.length}</p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-1">Payment Method:</p>
                <p className="text-gray-700">{order.paymentMethod || "N/A"}</p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-1">Payment Status:</p>
                <p className={`font-medium ${order.paymentStatus === "Completed" || order.payment ? "text-green-600" : "text-orange-600"}`}>
                  {order.paymentStatus || (order.payment ? "Completed" : "Pending")}
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-1">Order Date:</p>
                <p className="text-gray-700">{new Date(order.date).toLocaleDateString()}</p>
                <p className="text-gray-500 text-xs">{new Date(order.date).toLocaleTimeString()}</p>
              </div>
            </div>
            
            {/* Order Amount */}
            <div>
              <p className="font-semibold text-gray-900 mb-2">Total Amount:</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {formatPrice(order.amount)}
              </p>
            </div>
            
            {/* Status & Actions */}
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Order Status:</p>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium ${getStatusStyles(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-2">Update Status:</p>
                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status}
                  className="w-full p-2 font-semibold text-xs border border-gray-300 rounded focus:outline-none focus:border-black"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
