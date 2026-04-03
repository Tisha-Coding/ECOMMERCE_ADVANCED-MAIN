import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    // Ensure products is not undefined before trying to filter
    if (products?.length > 0) {
      const bestProduct = products.filter((item) => item.bestSeller);
      // Slice only if there are more than 2 bestsellers
      setBestSeller(bestProduct.slice(0, 2));
    }
  }, [products]);

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={"BEST"} text2={"SELLERS"} />
        <p className="w-3/4 m-auto text-xs sm:text-base text-gray-600">
          See our bestSellers
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {bestSeller.length > 0 ? (
          bestSeller.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              name={item.name}
              image={item.image}
              price={item.price}
              finalPrice={item.finalPrice}
              saleApplied={item.saleApplied}
              saleDiscountPercentage={item.saleDiscountPercentage}
            />
          ))
        ) : (
          <p className="col-span-5 text-center text-gray-500">
            No bestsellers available.
          </p>
        )}
      </div>
    </div>
  );
};

export default BestSeller;
