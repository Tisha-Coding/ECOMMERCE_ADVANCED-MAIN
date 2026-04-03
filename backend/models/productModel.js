import mongoose from "mongoose";

// schema is a structure using which we will create the data in the database

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  sizes: {
    type: Array,
    required: true,
  },
  bestSeller: {
    type: Boolean,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
});

// prevent creation of model again and again
const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
