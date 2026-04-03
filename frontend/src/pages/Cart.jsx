import { useContext, useState, useEffect } from "react";
import React from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateQuantity,
    navigate,
    deleteFromCart,
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { _id, size } or null

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  const handleQuantityChange = (itemId, size, newQuantity) => {
    if (newQuantity < 1) {
      return; // Don't allow quantity less than 1
    }
    updateQuantity(itemId, size, newQuantity);
  };

  const handleDecrement = (itemId, size, currentQuantity) => {
    if (currentQuantity > 1) {
      handleQuantityChange(itemId, size, currentQuantity - 1);
    }
  };

  const handleIncrement = (itemId, size, currentQuantity) => {
    handleQuantityChange(itemId, size, currentQuantity + 1);
  };

  const handleDeleteClick = (itemId, size) => {
    setDeleteConfirm({ _id: itemId, size });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteFromCart(deleteConfirm._id, deleteConfirm.size);
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const isCartEmpty = cartData.length === 0;

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>
      {isCartEmpty ? (
        <div className="py-16 text-center text-gray-600">
          <p className="text-lg sm:text-xl font-medium mb-2">
            Your cart is empty
          </p>
          <p className="text-sm sm:text-base mb-6">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="bg-black text-white text-sm px-8 py-3"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      ) : (
        <>
          <div>
            {cartData.map((item, index) => {
              const productData = products.find(
                (product) => product._id === item._id
              );
              return (
                <div
                  key={index}
                  className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_1fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
                >
                  <div className="flex items-start gap-6">
                    <img
                      className="w-16 sm:w-20"
                      src={productData.image[0]}
                      alt=""
                    />
                    <div>
                      <p className="text-xs sm:text-lg font-medium">
                        {productData.name}
                      </p>
                      <div className="flex items-center gap-5 mt-2">
                        {productData.saleApplied && productData.finalPrice && Math.abs(productData.finalPrice - productData.price) > 0.01 ? (
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900 font-medium">
                              {currency}{Number(productData.finalPrice).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-gray-400 line-through text-sm">
                              {currency}{Number(productData.price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        ) : (
                          <p>
                            {currency}{Number(productData.price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </p>
                        )}
                        <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                          {item.size}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() =>
                          handleDecrement(item._id, item.size, item.quantity)
                        }
                        disabled={item.quantity <= 1}
                        className="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "0") {
                            handleDeleteClick(item._id, item.size);
                          } else {
                            handleQuantityChange(
                              item._id,
                              item.size,
                              Number(value)
                            );
                          }
                        }}
                        className="w-10 sm:w-14 text-center border-0 outline-none px-1 sm:px-2 py-1"
                        type="number"
                        min={1}
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        onClick={() =>
                          handleIncrement(item._id, item.size, item.quantity)
                        }
                        className="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <img
                      onClick={() => handleDeleteClick(item._id, item.size)}
                      className="w-4 mr-4 sm:w-5 cursor-pointer hover:opacity-70"
                      src={assets.bin_icon}
                      alt="Delete item"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end my-20">
            <div className="w-full sm:w-[450px]">
              <CartTotal />
              <div className="w-full text-end">
                <button
                  onClick={() => navigate("/place-order")}
                  className="bg-black text-white text-sm my-8 px-8 py-3"
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Remove item from cart?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to remove this item from your cart? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
