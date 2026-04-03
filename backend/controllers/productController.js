import { v2 as Cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import { getSettings } from "../models/settingsModel.js";

// Helper: Apply sale discount to product
const applySaleDiscount = (product, saleActive, saleDiscountPercentage) => {
  const originalPrice = product.price;
  let finalPrice = originalPrice;
  let saleApplied = false;

  if (saleActive && saleDiscountPercentage > 0) {
    finalPrice = originalPrice - (originalPrice * saleDiscountPercentage / 100);
    saleApplied = true;
  }

  return {
    ...product.toObject ? product.toObject() : { ...product },
    price: originalPrice, // Keep original price
    finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimals
    saleApplied,
    saleDiscountPercentage: saleApplied ? saleDiscountPercentage : 0,
  };
};

// Function for adding a product
const addProduct = async (req, res) => {
  try {
    console.log(req.files); // Log to inspect the structure of req.files

    // Extract form data from req.body
    const {
      name,
      description,
      category,
      price,
      subCategory,
      bestSeller,
      sizes,
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !price || !sizes) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    // Access the uploaded files, check if they exist before accessing the first element
    const image1 = req.files["image1"] ? req.files["image1"][0] : null;
    const image2 = req.files["image2"] ? req.files["image2"][0] : null;
    const image3 = req.files["image3"] ? req.files["image3"][0] : null;
    const image4 = req.files["image4"] ? req.files["image4"][0] : null;

    // Filter out images that were not uploaded (null values)
    const uploadedImages = { image1, image2, image3, image4 };
    const validImages = {};

    // Only include non-null images in the response
    Object.keys(uploadedImages).forEach((key) => {
      if (uploadedImages[key]) {
        validImages[key] = uploadedImages[key];
      }
    });

    // Check if at least one image is uploaded
    if (Object.keys(validImages).length === 0) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    // Upload images to Cloudinary
    let imagesUrl = await Promise.all(
      Object.values(validImages).map(async (image) => {
        let result = await Cloudinary.uploader.upload(image.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // Build the product data to save
    const productsData = {
      name,
      description,
      category,
      price: Number(price), // Ensure price is a number
      subCategory: subCategory || "", // Handle optional subCategory
      bestSeller: bestSeller === "true" ? true : false, // Convert to boolean
      sizes: JSON.parse(sizes), // Parse sizes if it’s coming as a JSON string
      image: imagesUrl, // Store the array of image URLs
      date: Date.now(),
    };

    console.log(productsData);

    const product = new productModel(productsData);
    await product.save();

    // Respond with success
    res.status(200).json({
      message: "Product added successfully",
      product, // Return the saved product info including images
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Error adding product", error });
  }
};

const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    const settings = await getSettings();

    // Apply sale discount to all products
    const productsWithSale = products.map((product) =>
      applySaleDiscount(
        product,
        settings.saleActive,
        settings.saleDiscountPercentage
      )
    );

    res.json({ success: true, products: productsWithSale });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    const settings = await getSettings();
    const productWithSale = applySaleDiscount(
      product,
      settings.saleActive,
      settings.saleDiscountPercentage
    );

    res.json({ success: true, product: productWithSale });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addProduct, listProducts, removeProduct, singleProduct };
