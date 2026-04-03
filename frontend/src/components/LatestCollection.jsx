import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    if (products && products.length > 0) {
      setLatestProducts(products.slice(0, 10)); // Get the latest 10 products
    }
  }, [products]); // Update when products change

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"LATEST"} text2={"COLLECTION"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          See our latest collections
        </p>
      </div>

      {/* Rendering Products */}
      <div className="grid grid-cols-2 s:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {latestProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
            finalPrice={item.finalPrice}
            saleApplied={item.saleApplied}
            saleDiscountPercentage={item.saleDiscountPercentage}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
