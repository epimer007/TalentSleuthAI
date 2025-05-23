import React, { useState } from "react";
import "./Auth.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Login({ onLoginSuccess, setLogin, notify }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      notify("Login successful!", "#00ff00");
      navigate("/"); // Redirect to home page
      localStorage.setItem("talentUser", JSON.stringify(res.data.user)); // Save user to localStorage
      setLogin(true);
      if (onLoginSuccess) {
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      notify("Login failed!", "#ff0000");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={loginUser} className="auth-form">
        <h2>Login to TalentSleuth AI</h2>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              onClick={togglePasswordVisibility}
              className="eye-icon"
            />
          </div>
        </div>

        <button type="submit" className="login-btn">
          Login
        </button>

        <p className="register-link">
          Don't have an account?{" "}
          <u onClick={() => navigate("/Register")}>Register</u>
        </p>
      </form>
    </div>
  );
}
