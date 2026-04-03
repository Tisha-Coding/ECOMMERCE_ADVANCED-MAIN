import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";

const formatPrice = (amount) =>
  `${currency}${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ token }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Auto-refresh dashboard every 30 seconds
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsResponse = await axios.get(backendUrl + "/api/product/list");
      const products = productsResponse.data.success ? productsResponse.data.products : [];

      // Fetch orders
      const ordersResponse = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      const orders = ordersResponse.data?.orders || [];

      // Calculate stats
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(
        (order) =>
          order.status !== "Delivered" && order.status !== "Cancelled"
      ).length;
      
      // Revenue calculation: Only count orders that are:
      // 1. Payment completed (order.payment === true OR paymentStatus === "Completed")
      // 2. Status is "Delivered" (order has been successfully delivered)
      // This ensures we only count actual revenue from completed transactions
      const totalRevenue = orders
        .filter((order) => 
          order.status === "Delivered" && 
          (order.payment === true || order.paymentStatus === "Completed")
        )
        .reduce((sum, order) => sum + (order.amount || 0), 0);

      // Get recent 5 orders
      const recent = orders
        .slice()
        .reverse()
        .slice(0, 5);

      setStats({
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
      });
      setRecentOrders(recent);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = String(status || "").trim().toUpperCase();
    switch (normalizedStatus) {
      case "ORDER PLACED":
      case "PACKING":
        return "text-amber-600";
      case "SHIPPED":
      case "OUT FOR DELIVERY":
        return "text-blue-600";
      case "DELIVERED":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/list")}
        >
          <p className="text-gray-500 text-sm mb-2">Total Products</p>
          <p className="text-3xl font-bold text-gray-800 mb-3">{stats.totalProducts}</p>
          <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mt-2">
            <span className="border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-colors">
              View all
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/orders")}
        >
          <p className="text-gray-500 text-sm mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-gray-800 mb-3">{stats.totalOrders}</p>
          <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mt-2">
            <span className="border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-colors">
              View all
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/orders")}
        >
          <p className="text-gray-500 text-sm mb-2">Pending Orders</p>
          <p className="text-3xl font-bold text-amber-600 mb-3">{stats.pendingOrders}</p>
          <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mt-2">
            <span className="border border-amber-300 text-amber-600 px-2 py-1 rounded hover:bg-amber-50 transition-colors">
              Manage
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <p className="text-gray-500 text-sm mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">
            {formatPrice(stats.totalRevenue)}
          </p>
          <p className="text-xs text-gray-400 mt-2">Paid + delivered orders only</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
          <button
            onClick={() => navigate("/orders")}
            className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            View all
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Order ID</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Customer</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Items</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Amount</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-700">
                      {order._id?.slice(-6) || "N/A"}
                    </td>
                    <td className="py-3 px-3 text-gray-700">
                      {order.address?.firstName} {order.address?.lastName}
                    </td>
                    <td className="py-3 px-3 text-gray-700">{order.items?.length || 0}</td>
                    <td className="py-3 px-3 text-gray-700 font-medium">
                      {formatPrice(order.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-medium ${getStatusColor(order.status)}`}>
                        {order.status || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-xs">
                      {order.date
                        ? new Date(order.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
