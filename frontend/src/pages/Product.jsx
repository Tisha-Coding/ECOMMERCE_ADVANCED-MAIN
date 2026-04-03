import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token, navigate } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [activeTab, setActiveTab] = useState("description"); // "description" | "reviews"

  const fetchProductData = () => {
    products.forEach((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        return null;
      }
    });
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  // ---- Reviews helpers (localStorage-based) ----
  const storageKey = `reviews_${productId}`;

  const loadReviews = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        setReviews([]);
      }
    } catch (error) {
      setReviews([]);
    }
  };

  const saveReviews = (updatedReviews) => {
    setReviews(updatedReviews);
    localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
  };

  useEffect(() => {
    if (productId) {
      loadReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount === 0
      ? 0
      : reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!ratingInput) {
      setReviewError("Please select a rating.");
      return;
    }
    if (!commentInput.trim()) {
      setReviewError("Please write a short review.");
      return;
    }

    const newReview = {
      rating: ratingInput,
      comment: commentInput.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newReview, ...reviews];
    saveReviews(updated);
    setRatingInput(0);
    setCommentInput("");
    setReviewError("");
  };

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product data */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* ------- Product Images ---------- */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt=" " />
          </div>
        </div>

        {/* --------------- Product Info ------------------ */}

        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= Math.round(averageRating);
              return (
                <img
                  key={star}
                  src={isFilled ? assets.star_icon : assets.star_dull_icon}
                  alt={isFilled ? "Filled star" : "Empty star"}
                  className="w-3.5"
                />
              );
            })}
            <p className="pl-2 text-xs text-gray-600">
              {averageRating > 0 ? averageRating.toFixed(1) : "No rating yet"}{" "}
              {reviewCount > 0 && `(${reviewCount} review${reviewCount > 1 ? "s" : ""})`}
            </p>
          </div>
          <div className="mt-5">
            {productData.saleApplied && productData.finalPrice && Math.abs(productData.finalPrice - productData.price) > 0.01 ? (
              <div className="flex items-center gap-3">
                <p className="text-3xl font-medium text-gray-900">
                  {currency}{Number(productData.finalPrice).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xl text-gray-400 line-through">
                  {currency}{Number(productData.price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </p>
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {productData.saleDiscountPercentage || Math.round(((productData.price - productData.finalPrice) / productData.price) * 100)}% OFF
                </span>
              </div>
            ) : (
              <p className="text-3xl font-medium">
                {currency}{Number(productData.price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ----------------- Description and Review section ----------- */}

      <div className="mt-20">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`border px-5 py-3 text-sm transition-colors ${
              activeTab === "description"
                ? "font-semibold text-gray-900 bg-white"
                : "text-gray-500 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`border-t border-b border-r px-5 py-3 text-sm transition-colors ${
              activeTab === "reviews"
                ? "font-semibold text-gray-900 bg-white"
                : "text-gray-500 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            Reviews ({reviewCount})
          </button>
        </div>
        {/* -------- Description Box --------- */}

        <div className="flex flex-col gap-6 border px-6 py-6 text-sm text-gray-500">
          {activeTab === "description" ? (
            <>
              {productData.description ? (
                // Split description by newlines or double newlines to show as paragraphs
                productData.description.split(/\n\n|\n/).map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="whitespace-pre-line">
                      {paragraph.trim()}
                    </p>
                  )
                ))
              ) : (
                <p className="text-gray-400 italic">
                  No description available for this product.
                </p>
              )}
            </>
          ) : (
            <>
              {/* Write a review - only for logged-in users */}
              <div>
                <h3 className="text-gray-800 font-medium mb-3 text-sm md:text-base">
                  Write a review
                </h3>
                {token ? (
                  <form className="space-y-3" onSubmit={handleSubmitReview}>
                    <div>
                      <p className="text-xs text-gray-700 mb-1">Your rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingInput(star)}
                            className="focus:outline-none"
                          >
                            <img
                              src={
                                star <= ratingInput
                                  ? assets.star_icon
                                  : assets.star_dull_icon
                              }
                              alt={star <= ratingInput ? "Selected star" : "Unselected star"}
                              className="w-4"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-700 mb-1">Your review</p>
                      <textarea
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                        placeholder="Share your experience with this product"
                      />
                    </div>

                    {reviewError && (
                      <p className="text-xs text-red-500">{reviewError}</p>
                    )}

                    <button
                      type="submit"
                      className="bg-black text-white px-6 py-2 text-xs md:text-sm rounded active:bg-gray-800"
                    >
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <div className="py-4 text-center border border-gray-200 rounded bg-gray-50">
                    <p className="text-gray-600 text-sm mb-3">
                      Please log in to write a review for this product.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800"
                    >
                      Log in
                    </button>
                  </div>
                )}
              </div>

              {/* Reviews list */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-gray-800 font-medium mb-3 text-sm md:text-base">
                  Customer reviews
                </h3>
                {reviews.length === 0 ? (
                  <p className="text-xs md:text-sm text-gray-500">
                    No reviews yet. Be the first to review this product.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {reviews.map((rev, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded px-3 py-2 text-xs md:text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <img
                                key={star}
                                src={
                                  star <= (rev.rating || 0)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                                }
                                alt={
                                  star <= (rev.rating || 0)
                                    ? "Filled star"
                                    : "Empty star"
                                }
                                className="w-3"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ------  display related products ------ */}

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
