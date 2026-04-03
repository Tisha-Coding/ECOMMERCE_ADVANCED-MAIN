import userModel from "../models/userModel.js";

// Add products to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;

    // Validate required fields
    if (!userId || !itemId || !size) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};

    // Update cart data
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

    // Save updated cart data
    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update user cart
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body;

    // Validate required fields
    if (!userId || !itemId || !size || typeof quantity === "undefined") {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Validate quantity (ensure it's a positive integer)
    if (!Number.isInteger(quantity) || quantity < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });
    }

    // Fetch user data
    const userData = await userModel.findById(userId);

    // Check if user exists
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};

    // Ensure cart item exists before updating
    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    // Update the size and quantity for the item
    cartData[itemId][size] = quantity;

    // Save updated cart data
    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get user cart data
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};

    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete product from user cart
const deleteFromCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;

    // Validate required fields
    if (!userId || !itemId || !size) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};

    // Remove the size from the item
    if (cartData[itemId] && cartData[itemId][size]) {
      delete cartData[itemId][size];

      // Remove the entire item if no sizes are left
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    }

    // Save updated cart data
    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart, deleteFromCart };
