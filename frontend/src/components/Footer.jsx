import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="" />
          <p className="w-full md:w-2/3 text-gray-600">
            At Forever, we believe in creating memories through style. Explore
            our collection and find your perfect look.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+91 7973208007</li>
            <li>contact@foreveryou.com</li>
          </ul>
        </div>
      </div>
      <hr className="w-full border-gray-300" />
      <p className="py-5 text-sm text-center w-full">
        Copyright 2025@forever.com - All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
