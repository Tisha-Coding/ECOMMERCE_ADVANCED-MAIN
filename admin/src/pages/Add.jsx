import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("MEN");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim() || name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!price || parseFloat(price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!image1 && !image2 && !image3 && !image4) {
      newErrors.images = "At least one image is required";
    }

    if (sizes.length === 0) {
      newErrors.sizes = "At least one size must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestSeller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );
      console.log(response.data); // For debugging

      if (response.data.message === "Product added successfully") {
        toast.success(response.data.message); // Success toast
        setName("");
        setDescription("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setSizes([]);
        setBestseller(false);
        setErrors({});
      } else {
        toast.error("Failed to add product."); // Default error message
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while adding the product."); // General error toast
    }
  };

  const handleSizeToggle = (size) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((item) => item !== size)
        : [...prev, size]
    );
    // Clear size error when user selects a size
    if (errors.sizes) {
      setErrors((prev) => ({ ...prev, sizes: "" }));
    }
  };

  const removeImage = (imageNum) => {
    switch (imageNum) {
      case 1:
        setImage1(false);
        break;
      case 2:
        setImage2(false);
        break;
      case 3:
        setImage3(false);
        break;
      case 4:
        setImage4(false);
        break;
    }
    // Clear image error if at least one image remains
    if (errors.images && (image1 || image2 || image3 || image4)) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4].map((num) => {
            const image = num === 1 ? image1 : num === 2 ? image2 : num === 3 ? image3 : image4;
            const setImage = num === 1 ? setImage1 : num === 2 ? setImage2 : num === 3 ? setImage3 : setImage4;
            return (
              <div key={num} className="relative">
                <label htmlFor={`image${num}`} className="cursor-pointer">
                  <img
                    className="w-20 h-20 object-cover border border-gray-300 rounded"
                    src={!image ? assets.upload_area : URL.createObjectURL(image)}
                    alt={`Upload ${num}`}
                  />
                  <input
                    onChange={(e) => {
                      setImage(e.target.files[0]);
                      if (errors.images) {
                        setErrors((prev) => ({ ...prev, images: "" }));
                      }
                    }}
                    type="file"
                    id={`image${num}`}
                    hidden
                    accept="image/*"
                  />
                </label>
                {image && (
                  <button
                    type="button"
                    onClick={() => removeImage(num)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
      </div>

      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: "" }));
            }
          }}
          value={name}
          className={`w-full max-w-[500px] px-3 py-2 border ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          type="text"
          placeholder="Type here"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="w-full">
        <p className="mb-2">Product description</p>
        <input
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) {
              setErrors((prev) => ({ ...prev, description: "" }));
            }
          }}
          value={description}
          className={`w-full max-w-[500px] px-3 py-2 border ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          type="text"
          placeholder="Write content here"
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-3 py-2"
          >
            <option value="MEN">Men</option>
            <option value="WOMEN">Women</option>
            <option value="KIDS">Kids</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub category</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full px-3 py-2"
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => {
              setPrice(e.target.value);
              if (errors.price) {
                setErrors((prev) => ({ ...prev, price: "" }));
              }
            }}
            value={price}
            className={`w-full px-3 py-2 sm:w-[120px] border ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            type="number"
            placeholder="25"
            min="0"
            step="0.01"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
      </div>

      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div key={size} onClick={() => handleSizeToggle(size)}>
              <p
                className={`${
                  sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"
                } px-3 py-1 cursor-pointer`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
        {errors.sizes && <p className="text-red-500 text-xs mt-1">{errors.sizes}</p>}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          onChange={(e) => setBestseller(e.target.checked)}
          className="checkbox"
          type="checkbox"
          id="bestseller"
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
        ADD
      </button>
    </form>
  );
};

export default Add;
