import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const SaleSettings = ({ token }) => {
  const [saleActive, setSaleActive] = useState(false);
  const [saleDiscountPercentage, setSaleDiscountPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSaleSettings();
  }, []);

  const fetchSaleSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/settings/sale`);
      if (response.data.success) {
        setSaleActive(response.data.saleActive);
        setSaleDiscountPercentage(response.data.saleDiscountPercentage);
      }
    } catch (error) {
      console.error("Failed to fetch sale settings:", error);
      toast.error("Failed to load sale settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saleActive && (saleDiscountPercentage < 1 || saleDiscountPercentage > 100)) {
      toast.error("Discount percentage must be between 1 and 100");
      return;
    }

    try {
      setSaving(true);
      console.log("Saving sale settings:", { saleActive, saleDiscountPercentage, token: token ? "present" : "missing" });
      const response = await axios.post(
        `${backendUrl}/api/settings/sale`,
        {
          saleActive,
          saleDiscountPercentage: saleActive ? saleDiscountPercentage : 0,
        },
        { 
          headers: { token },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log("Save response:", response.data);
      if (response.data.success) {
        toast.success("Sale settings updated successfully!");
        // Refresh settings after save
        await fetchSaleSettings();
      } else {
        toast.error(response.data.message || "Failed to update sale settings");
      }
    } catch (error) {
      console.error("Failed to update sale settings:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data?.message || "Failed to update sale settings");
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        console.error("Error:", error.message);
        toast.error(error.message || "Failed to update sale settings");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading sale settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sale Settings</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Sale Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-lg font-medium text-gray-800">
                Enable Global Sale
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Apply discount to all products when enabled
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={saleActive}
                onChange={async (e) => {
                  const newValue = e.target.checked;
                  setSaleActive(newValue);
                  if (!newValue) {
                    setSaleDiscountPercentage(0);
                  }
                  // Auto-save when toggle changes
                  try {
                    const response = await axios.post(
                      `${backendUrl}/api/settings/sale`,
                      {
                        saleActive: newValue,
                        saleDiscountPercentage: newValue ? saleDiscountPercentage : 0,
                      },
                      { headers: { token } }
                    );
                    if (response.data.success) {
                      toast.success(`Sale ${newValue ? 'enabled' : 'disabled'} successfully!`);
                    } else {
                      toast.error(response.data.message || "Failed to update sale settings");
                      // Revert on error
                      setSaleActive(!newValue);
                    }
                  } catch (error) {
                    console.error("Failed to update sale settings:", error);
                    toast.error(error.response?.data?.message || "Failed to update sale settings");
                    // Revert on error
                    setSaleActive(!newValue);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          {/* Discount Percentage */}
          {saleActive && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={saleDiscountPercentage || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 0;
                  if (value >= 0 && value <= 100) {
                    setSaleDiscountPercentage(value);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                placeholder="Enter discount percentage (1-100)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a value between 1 and 100
              </p>
            </div>
          )}

          {/* Preview */}
          {saleActive && saleDiscountPercentage > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <p className="text-sm text-gray-600">
                A product priced at $100 will be sold at $
                {Math.round((100 - (100 * saleDiscountPercentage) / 100) * 100) / 100} (
                {saleDiscountPercentage}% OFF)
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || (saleActive && saleDiscountPercentage === 0)}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <button
              onClick={fetchSaleSettings}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleSettings;
