import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import axios from "axios";

const Profile = () => {
  const { token, userName, backendUrl, navigate, setUserName } = useContext(ShopContext);
  const [userData, setUserData] = useState({
    name: userName || "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Check both token state and localStorage to prevent redirect on refresh
    const storedToken = localStorage.getItem("token");
    if (!token && !storedToken) {
      navigate("/login");
      return;
    }
    // If token exists in localStorage but not in state, update state
    if (!token && storedToken) {
      // Token will be loaded by ShopContext, just wait
      return;
    }

    // Fetch user profile from backend
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { token },
        });
        if (response.data.success && response.data.user) {
          const user = response.data.user;
          setUserData({
            name: user.name || userName || "",
            email: user.email || localStorage.getItem("userEmail") || "",
            phone: user.phone || "",
          });
        } else {
          // Fallback to localStorage if API fails
          const storedEmail = localStorage.getItem("userEmail");
          if (storedEmail) {
            setUserData((prev) => ({ ...prev, email: storedEmail }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Fallback to localStorage
        const storedEmail = localStorage.getItem("userEmail");
        if (storedEmail) {
          setUserData((prev) => ({ ...prev, email: storedEmail }));
        }
      }
    };

    fetchProfile();
  }, [token, navigate, backendUrl, userName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow editing name and phone, not email
    if (name === "email") return;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Update profile via backend API (name and phone only)
      const response = await axios.post(
        `${backendUrl}/api/user/profile`,
        {
          name: userData.name,
          phone: userData.phone,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        const updatedUser = response.data.user;
        // Update localStorage for name (for Navbar)
        if (updatedUser.name) {
          localStorage.setItem("userName", updatedUser.name);
          setUserName(updatedUser.name);
        }
        // Update local state
        setUserData({
          name: updatedUser.name || "",
          email: updatedUser.email || userData.email,
          phone: updatedUser.phone || "",
        });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    // Reset to current saved values (re-fetch from backend)
    const fetchCurrent = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { token },
        });
        if (response.data.success && response.data.user) {
          const user = response.data.user;
          setUserData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
          });
        }
      } catch (error) {
        // Fallback to current state
        console.error("Failed to fetch current profile:", error);
      }
    };
    fetchCurrent();
    setIsEditing(false);
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"PROFILE"} />
      </div>

      <div className="max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Personal Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-gray-600 hover:text-black border border-gray-300 px-4 py-2 rounded"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-black text-gray-900"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-gray-900 font-medium py-1.5">
                  {userData.name || "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Email Address
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Enter your email"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Email cannot be changed
                  </p>
                </div>
              ) : (
                <p className="text-gray-900 font-medium py-1.5">
                  {userData.email || "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-black text-gray-900"
                  placeholder="Enter your phone number"
                  maxLength={10}
                />
              ) : (
                <p className="text-gray-900 font-medium py-1.5">
                  {userData.phone || "Not added yet"}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-100 text-gray-700 px-6 py-2 text-sm rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
          <h2 className="text-xl font-medium text-gray-800 mb-4">
            Account Actions
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/orders")}
              className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              View Order History
            </button>
            <button
              onClick={() => navigate("/collection")}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
