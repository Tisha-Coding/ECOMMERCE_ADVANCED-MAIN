import React, { useState, useEffect } from "react";
import axios from "axios";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const validatePassword = (pwd) => {
    const p = String(pwd || "").trim();
    if (p.length < 8) return false;
    const hasAlphabet = /[a-zA-Z]/.test(p);
    const hasDigit = /[0-9]/.test(p);
    const hasSpecial = /[^a-zA-Z0-9]/.test(p);
    return hasAlphabet && hasDigit && hasSpecial;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const pwd = String(password || "").trim();
    const confirmPwd = String(confirmPassword || "").trim();

    if (!pwd || !confirmPwd) {
      toast.error("Please fill in all fields");
      return;
    }

    if (pwd !== confirmPwd) {
      toast.error("Passwords do not match");
      return;
    }

    if (!validatePassword(pwd)) {
      toast.error(
        "Password must be at least 8 characters and include letters, numbers and a special character"
      );
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/user/reset-password`, {
        token,
        password: pwd,
      });

      if (response.data.success) {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Invalid or expired reset token. Please request a new one.";
      toast.error(errorMessage);
      
      // If token is invalid/expired, redirect to forgot password
      if (error.response?.status === 400 || errorMessage.includes("expired")) {
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14">
      <div className="inline-flex items-center gap-2 mb-6 mt-10">
        <p className="prata-regular text-3xl">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800"></hr>
      </div>

      <form onSubmit={onSubmitHandler} className="w-full flex flex-col gap-4">
        <p className="text-sm text-gray-600 mb-2">
          Enter your new password below.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="New Password (min 8 chars, letters + numbers + special)"
          required
          disabled={loading}
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Confirm New Password"
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
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
