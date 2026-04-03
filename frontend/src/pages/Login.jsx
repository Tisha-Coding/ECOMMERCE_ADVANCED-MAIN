import React, { useContext } from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, backendUrl, setUserName } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        // Must be exactly: something@gmail.com (something can be 1+ chars, no spaces, no @)
        if (!/^[a-zA-Z0-9._-]+@gmail\.com$/.test(normalizedEmail)) {
          toast.error("Only Gmail addresses are allowed (e.g. you@gmail.com)");
          return;
        }

        const pwd = String(password || "").trim();
        const hasAlphabet = /[a-zA-Z]/.test(pwd);
        const hasDigit = /[0-9]/.test(pwd);
        const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
        if (pwd.length < 8 || !hasAlphabet || !hasDigit || !hasSpecial) {
          toast.error(
            "Password must be at least 8 characters and include letters, numbers and a special character"
          );
          return;
        }

        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });
        if (response.data.success) {
          toast.success("Successfully Signed Up, Please Login");
          // Switch to login state after signup
          setCurrentState("Login");
          // Clear name field after signup
          setName("");
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          
          // Store user name - if backend returns name, use it, otherwise extract from email
          const userName = response.data.name || email.split("@")[0];
          const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);
          setUserName(displayName);
          localStorage.setItem("userName", displayName);
          localStorage.setItem("userEmail", email);
          
          toast.success("Login successful!");
          navigate("/"); // Redirect to homepage or desired page after login
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/"); // Redirect after successful login
    }
  }, [token, navigate]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800"></hr>
      </div>
      {currentState === "Login" ? (
        ""
      ) : (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Name"
          required
        />
      )}
      <input
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder={currentState === "Sign Up" ? "Email (only Gmail, e.g. you@gmail.com)" : "Email"}
        required
      />
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder={currentState === "Sign Up" ? "Min 8 characters, letters + numbers" : "Password"}
        required
      />
      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p 
          onClick={() => navigate("/forgot-password")}
          className="cursor-pointer hover:underline"
        >
          Forgot your password?
        </p>
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Create account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Login Here
          </p>
        )}
      </div>
      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
