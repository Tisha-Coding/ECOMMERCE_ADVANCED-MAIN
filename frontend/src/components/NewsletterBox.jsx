import React from "react";
import { toast } from "react-toastify";

const NewsletterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
    toast.success("Subscribed successfully!");
  };

  return (
    <div>
      <div className="text-center">
        <p className="text-2xl font-medium text-gray-800">
          Subscribe now & get 20% off
        </p>
        <p className="text-gray-400 mt-3">Subscribe to our NewsLetter</p>
        <form
          onSubmit={onSubmitHandler}
          className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border p1-3"
        >
          <input
            className="w-full sm:flex-1 outline-none pl-2"
            type="email"
            placeholder="Enter your email"
            required
          />
          <button
            type="submit"
            className="bg-black text-white text-xs px-10 py-4"
          >
            SUBSCRIBE
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterBox;
