import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price, finalPrice, saleApplied, saleDiscountPercentage }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link className="text-gray-700 cursor-pointer relative" to={`/product/${id}`}>
      {saleApplied && saleDiscountPercentage > 0 && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
          {saleDiscountPercentage}% OFF
        </span>
      )}
      <div className="overflow-hidden">
        <img
          className="hover:scale-110 transition ease-in-out"
          src={image[0]}
          alt=""
        />
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <div className="flex items-center gap-2">
        {saleApplied && finalPrice && Math.abs(finalPrice - price) > 0.01 ? (
          <>
            <p className="text-sm font-medium text-gray-900">
              {currency}{Number(finalPrice).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400 line-through">
              {currency}{Number(price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </p>
          </>
        ) : (
          <p className="text-sm font-medium">
            {currency}{Number(price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductItem;
