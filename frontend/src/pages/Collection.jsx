import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import axios from "axios";
import { toast } from "react-toastify";

const Collection = () => {
  const { search, showSearch, setSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(true);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortOrder, setSortOrder] = useState("relevant");
  const [sortType, setSortType] = useState("relevant");
  const [products, setProducts] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      console.log("Full response:", response.data.products); // Check the full response
      if (response.data.success) {
        setProducts(response.data.products);
        setFilterProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching products", error);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    console.log("Products in context:", products);
    getProductsData();
  }, []);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    if (sortOrder === "low-high") {
      productsCopy.sort((a, b) => {
        const priceA = a.finalPrice && a.saleApplied ? a.finalPrice : a.price;
        const priceB = b.finalPrice && b.saleApplied ? b.finalPrice : b.price;
        return priceA - priceB;
      });
    } else if (sortOrder === "high-low") {
      productsCopy.sort((a, b) => {
        const priceA = a.finalPrice && a.saleApplied ? a.finalPrice : a.price;
        const priceB = b.finalPrice && b.saleApplied ? b.finalPrice : b.price;
        return priceB - priceA;
      });
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => {
          const priceA = a.finalPrice && a.saleApplied ? a.finalPrice : a.price;
          const priceB = b.finalPrice && b.saleApplied ? b.finalPrice : b.price;
          return priceA - priceB;
        }));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => {
          const priceA = a.finalPrice && a.saleApplied ? a.finalPrice : a.price;
          const priceB = b.finalPrice && b.saleApplied ? b.finalPrice : b.price;
          return priceB - priceA;
        }));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, sortOrder, search, showSearch]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortType(value);
    setSortOrder(value);
  };

  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setSearch("");
    setSortOrder("relevant");
    setSortType("relevant");
  };

  const hasActiveFilters = category.length > 0 || subCategory.length > 0 || (showSearch && search);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden transition-transform duration-300 ${
              showFilter ? "rotate-180" : ""
            }`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>

        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"MEN"}
                onChange={toggleCategory}
              />
              Men
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"WOMEN"}
                onChange={toggleCategory}
              />
              Women
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"KIDS"}
                onChange={toggleCategory}
              />
              Kids
            </p>
          </div>
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Topwear"}
                onChange={toggleSubCategory}
              />{" "}
              Topwear
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Bottomwear"}
                onChange={toggleSubCategory}
              />{" "}
              Bottomwear
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Winterwear"}
                onChange={toggleSubCategory}
              />{" "}
              Winterwear
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
          <select
            onChange={handleSortChange}
            className="border-2 border-gray-300 text-sm px-2"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {filterProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-600">
            <p className="text-lg sm:text-xl font-medium mb-2">
              No products found
            </p>
            <p className="text-sm sm:text-base mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters or search terms to find what you're looking for."
                : "No products available at the moment."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-black text-white text-sm px-8 py-3"
              >
                CLEAR FILTERS
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {filterProducts.map((item, index) => (
              <ProductItem
                key={index}
                name={item.name}
                id={item._id}
                price={item.price}
                finalPrice={item.finalPrice}
                saleApplied={item.saleApplied}
                saleDiscountPercentage={item.saleDiscountPercentage}
                image={item.image}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
