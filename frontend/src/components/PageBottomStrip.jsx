import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const PageBottomStrip = () => {
  const features = [
    {
      icon: assets.parcel_icon,
      title: "Free Shipping",
      desc: "On orders above ₹999",
      highlight: "FREE",
    },
    {
      icon: assets.exchange_icon,
      title: "Easy Returns",
      desc: "7-day hassle-free returns",
      highlight: "7 Days",
    },
    {
      icon: assets.quality_icon,
      title: "Secure Payment",
      desc: "100% secure transactions",
      highlight: "100%",
    },
    {
      icon: assets.support_img,
      title: "24/7 Support",
      desc: "Always here to help",
      highlight: "24/7",
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "50K+", label: "Orders Delivered" },
    { number: "4.8★", label: "Average Rating" },
  ];

  return (
    <section className="relative border-t border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 sm:py-16 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-black rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-black rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Stats Section */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-12">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="text-center group cursor-default"
            >
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 group-hover:text-black transition-colors duration-300">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-lg p-4 sm:p-6 border border-gray-200 hover:border-black hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  />
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 mb-1">
                  {feature.title}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 mb-2">
                  {feature.desc}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-black bg-gray-100 px-2 py-1 rounded-full">
                  {feature.highlight}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-block">
            <Link
              to="/shop"
              className="group relative inline-flex items-center gap-2 bg-black text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Explore Our Collection</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-gray-500">
            Join thousands of satisfied customers shopping with us
          </p>
        </div>
      </div>
    </section>
  );
};

export default PageBottomStrip;
