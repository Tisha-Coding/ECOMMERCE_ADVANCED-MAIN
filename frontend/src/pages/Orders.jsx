import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext);

  const [orderData, setorderData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const normalizeStatus = (status) => String(status || "").trim().toUpperCase();

  const getStatusStyles = (status) => {
    switch (normalizeStatus(status)) {
      case "PENDING":
      case "PROCESSING":
        return "bg-amber-50 text-amber-800 border border-amber-200";
      case "SHIPPED":
      case "DISPATCHED":
        return "bg-sky-50 text-sky-800 border border-sky-200";
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-800 border border-emerald-200";
      case "CANCELLED":
      case "CANCELED":
        return "bg-rose-50 text-rose-800 border border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const filteredOrders =
    statusFilter === "ALL"
      ? orderData
      : orderData.filter(
          (item) => normalizeStatus(item.status) === normalizeStatus(statusFilter)
        );

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      // console.log(response.data);
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item, itemIdx) => {
            const itemWithOrderInfo = {
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
              // Human-friendly orderId from backend; may be missing for very old orders
              orderId: order.orderId || null,
              // Fallback internal Mongo ID for keys/tooltips
              orderMongoId: order._id,
              orderAmount: order.amount,
              showOrderTotal: itemIdx === 0, // Show total only for first item of each order
            };
            allOrdersItem.push(itemWithOrderInfo);
          });
        });
        // reverse() -> so that latest data gets displayed first
        setorderData(allOrdersItem.reverse());
      }
    } catch (error) {}
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {orderData.length === 0 ? (
        <div className="py-16 text-center text-gray-600">
          <p className="text-lg sm:text-xl font-medium mb-2">
            You have no orders yet
          </p>
          <p className="text-sm sm:text-base mb-6">
            Start shopping to see your orders here.
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="bg-black text-white text-sm px-8 py-3"
          >
            BROWSE COLLECTION
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 mb-2">
            <p className="text-sm text-gray-600">
              Showing <b>{filteredOrders.length}</b> item
              {filteredOrders.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 text-sm px-3 py-2 rounded"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {statusFilter !== "ALL" && (
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className="text-sm underline text-gray-600 hover:text-black"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              <p className="text-lg sm:text-xl font-medium mb-2">
                No orders with this status
              </p>
              <p className="text-sm sm:text-base mb-6">
                Try selecting a different status filter.
              </p>
              <button
                onClick={() => setStatusFilter("ALL")}
                className="bg-black text-white text-sm px-8 py-3"
              >
                SHOW ALL ORDERS
              </button>
            </div>
          ) : (
            filteredOrders.map((item, index) => {
              const statusClass = getStatusStyles(item.status);
              // Use orderId or Mongo _id + item index for unique key instead of just index
              const uniqueKey = `${item.orderId || item.orderMongoId || "unknown"}-${index}-${item.name}-${item.size}`;
              return (
                <div
                  key={uniqueKey}
                  className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-start gap-6 text-sm">
                    <img
                      className="w-16 sm:w-20"
                      src={item.image[0]}
                      alt={item.name}
                    />
                    <div>
                      <p className="sm:text-base font-medium">{item.name}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-base text-gray-700">
                        {item.finalPrice && item.saleApplied && item.finalPrice !== item.price ? (
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {currency}{Number(item.finalPrice).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-gray-400 line-through text-sm">
                              {currency}{Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </p>
                            {item.saleDiscountPercentage > 0 && (
                              <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded">
                                {item.saleDiscountPercentage}% OFF
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="font-medium">
                            {currency}{Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </p>
                        )}
                        <p>Quantity: {item.quantity}</p>
                        <p>Size: {item.size}</p>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-gray-400">
                        <strong className="font-semibold text-gray-500">
                          Order ID:
                        </strong>{" "}
                        <span>
                          {item.orderId || "Generating..."}
                        </span>
                      </p>

                      <p className="mt-2">
                        Date:{" "}
                        <span className="text-gray-400">
                          {new Date(item.date).toDateString()}
                        </span>
                      </p>

                      <p className="mt-2">
                        Payment:{" "}
                        <span className="text-gray-400">
                          {item.paymentMethod}
                        </span>
                      </p>
                      {item.showOrderTotal && item.orderAmount != null && (
                        <p className="mt-2 font-semibold text-gray-900">
                          Order Total: {currency}{Number(item.orderAmount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="md:w-1/2 flex justify-between items-center">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs sm:text-sm font-medium ${statusClass}`}
                    >
                      {item.status}
                    </span>
                    <button
                      onClick={() => {
                        // Refresh order data to get latest status for this specific order
                        loadOrderData();
                        // Optional: You could add a toast or highlight to show which order is being tracked
                      }}
                      className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50 transition-colors"
                      title={`Order ID: ${item.orderId || item.orderMongoId || "N/A"}`}
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
