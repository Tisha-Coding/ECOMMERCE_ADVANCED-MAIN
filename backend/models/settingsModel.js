import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  saleActive: {
    type: Boolean,
    default: false,
  },
  saleDiscountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
});

const settingsModel =
  mongoose.models.settings || mongoose.model("settings", settingsSchema);

// Helper function to get or create settings
export const getSettings = async () => {
  try {
    let settings = await settingsModel.findOne();
    if (!settings) {
      settings = await settingsModel.create({
        saleActive: false,
        saleDiscountPercentage: 0,
      });
    }
    return settings;
  } catch (error) {
    console.error("Error in getSettings:", error);
    throw error;
  }
};

export default settingsModel;
