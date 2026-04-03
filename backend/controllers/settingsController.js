import settingsModel, { getSettings } from "../models/settingsModel.js";

// Get current sale settings
const getSaleSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      success: true,
      saleActive: settings.saleActive || false,
      saleDiscountPercentage: settings.saleDiscountPercentage || 0,
    });
  } catch (error) {
    console.error("Error fetching sale settings:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to fetch sale settings" 
    });
  }
};

// Update sale settings (admin only)
const updateSaleSettings = async (req, res) => {
  try {
    console.log("Update sale settings request received:", req.body);
    const { saleActive, saleDiscountPercentage } = req.body;

    if (saleDiscountPercentage !== undefined) {
      if (saleDiscountPercentage < 0 || saleDiscountPercentage > 100) {
        return res.json({
          success: false,
          message: "Discount percentage must be between 0 and 100",
        });
      }
    }

    const settings = await getSettings();
    console.log("Current settings before update:", {
      saleActive: settings.saleActive,
      saleDiscountPercentage: settings.saleDiscountPercentage
    });

    if (saleActive !== undefined) {
      settings.saleActive = saleActive === true || saleActive === "true";
    }
    if (saleDiscountPercentage !== undefined) {
      settings.saleDiscountPercentage = Number(saleDiscountPercentage);
    }

    await settings.save();
    console.log("Settings saved successfully:", {
      saleActive: settings.saleActive,
      saleDiscountPercentage: settings.saleDiscountPercentage
    });

    res.json({
      success: true,
      message: "Sale settings updated successfully",
      saleActive: settings.saleActive,
      saleDiscountPercentage: settings.saleDiscountPercentage,
    });
  } catch (error) {
    console.error("Error updating sale settings:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to update sale settings" 
    });
  }
};

export { getSaleSettings, updateSaleSettings };
