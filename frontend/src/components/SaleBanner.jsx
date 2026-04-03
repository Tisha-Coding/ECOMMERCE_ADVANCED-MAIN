import React, { useState, useEffect } from "react";
import axios from "axios";

const SaleBanner = () => {
  const [saleSettings, setSaleSettings] = useState({
    saleActive: false,
    saleDiscountPercentage: 0,
  });
  const [prevSaleActive, setPrevSaleActive] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchSaleSettings = async () => {
      if (!backendUrl) {
        console.error("Backend URL not configured");
        return;
      }
      try {
        const response = await axios.get(`${backendUrl}/api/settings/sale`, {
          params: { _: Date.now() } // Cache busting
        });
        if (response.data.success) {
          const newSaleActive = Boolean(response.data.saleActive);
          const newDiscount = Number(response.data.saleDiscountPercentage) || 0;
          
          // If sale status changed, trigger immediate page reload
          if (prevSaleActive !== null && prevSaleActive !== newSaleActive) {
            console.log('Sale status changed - reloading page:', { from: prevSaleActive, to: newSaleActive });
            // Update state first
            setPrevSaleActive(newSaleActive);
            setSaleSettings({
              saleActive: newSaleActive,
              saleDiscountPercentage: newDiscount,
            });
            // Force immediate page reload (no delay)
            window.location.reload();
            return; // Exit early to prevent further execution
          }
          
          setPrevSaleActive(newSaleActive);
          setSaleSettings({
            saleActive: newSaleActive,
            saleDiscountPercentage: newDiscount,
          });
        }
      } catch (error) {
        console.error("Failed to fetch sale settings:", error.response?.data || error.message);
        // Silently fail - don't show banner if settings can't be loaded
      }
    };
    
    fetchSaleSettings();
    // Poll every 1.5 seconds to check for sale status changes (very fast detection)
    const interval = setInterval(fetchSaleSettings, 1500);
    
    return () => clearInterval(interval);
  }, [backendUrl]);

  if (!saleSettings.saleActive || saleSettings.saleDiscountPercentage === 0) {
    return null;
  }

  return (
    <div className="bg-black text-white text-center py-2 px-4 text-xs sm:text-sm font-medium">
      Festival Sale - Flat {saleSettings.saleDiscountPercentage}% OFF on All Products
    </div>
  );
};

export default SaleBanner;
