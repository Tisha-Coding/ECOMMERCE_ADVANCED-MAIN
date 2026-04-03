import React, { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    const normalizedEmail = (email || "").trim().toLowerCase();
    
    if (!normalizedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    // Validate Gmail format
    if (!/^[a-zA-Z0-9._-]+@gmail\.com$/.test(normalizedEmail)) {
      toast.error("Only Gmail addresses are allowed (e.g. you@gmail.com)");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/user/forgot-password`, {
        email: normalizedEmail,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Password reset link sent to your email");
        setEmail("");
        // Redirect to login after showing success message
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14">
      <div className="inline-flex items-center gap-2 mb-6 mt-10">
        <p className="prata-regular text-3xl">Forgot Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800"></hr>
      </div>

      <form onSubmit={onSubmitHandler} className="w-full flex flex-col gap-4">
        <p className="text-sm text-gray-600 mb-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Email (e.g. you@gmail.com)"
          required
          disabled={loading}
        />

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Back to Login
          </button>
          <button
            type="submit"
            className="flex-1 bg-black text-white font-light px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
