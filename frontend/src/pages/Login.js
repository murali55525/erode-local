import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Components from './Components';
import styled, { keyframes } from 'styled-components';
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Icons for password visibility toggle

// Animation for alert fade-in (unchanged)
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

// Styled Alert Component - Centered on screen (unchanged)
const AlertContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(65, 105, 225, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.3);
  max-width: 90%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 15px 20px;
    max-width: 80%;
  }
`;

const AlertCloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  margin-left: 15px;

  @media (max-width: 480px) {
    font-size: 16px;
    margin-left: 10px;
  }
`;

// New styled components for the added features
const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #4169E1;
  font-size: 16px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
  margin: 5px 0 0 0;
  font-family: 'Poppins', sans-serif;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
`;

const CheckboxLabel = styled.label`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #333;
  margin-left: 5px;
`;

const SocialLoginContainer = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const SocialButton = styled.button`
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  padding: 8px 15px;
  font-size: 14px;
  border-radius: 5px;
  cursor: not-allowed;
  margin: 0 5px;
  font-family: 'Poppins', sans-serif;
`;

function CustomAlert({ message, type, onClose }) {
  return (
    <AlertContainer type={type}>
      {message}
      <AlertCloseButton onClick={onClose}>×</AlertCloseButton>
    </AlertContainer>
  );
}

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [signIn, toggle] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: localStorage.getItem("rememberedEmail") || "", // Load remembered email
    password: ""
  });
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({ email: "", password: "" }); // For form validation
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
  const [rememberMe, setRememberMe] = useState(false); // Remember Me checkbox
  const [isLoading, setIsLoading] = useState(false); // Loading state for submission

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: value && !emailRegex.test(value) ? "Please enter a valid email address" : "",
      }));
    }
    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: value && value.length < 6 ? "Password must be at least 6 characters long" : "",
      }));
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {
      email: !formData.email
        ? "Email is required"
        : !emailRegex.test(formData.email)
        ? "Please enter a valid email address"
        : "",
      password: !formData.password
        ? "Password is required"
        : formData.password.length < 6
        ? "Password must be at least 6 characters long"
        : "",
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      showAlert(data.message, response.ok ? "success" : "error");
    } catch (error) {
      console.error("Signup Error:", error);
      showAlert("An error occurred during signup", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Store token and user details in localStorage
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");

        // Handle "Remember Me" functionality
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Call the onLoginSuccess callback and navigate to the home page
        onLoginSuccess(data.user, data.token);
        navigate("/home", { replace: true }); // Ensure navigation to the home page
      } else {
        showAlert(data.message, "error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      showAlert("An error occurred during login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <Components.CenteredContainer>
        <Components.Container>
          <Components.SignUpContainer signinIn={signIn}>
            <Components.Form onSubmit={handleSignUp}>
              <Components.Title>Create Account</Components.Title>
              <Components.Input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <InputWrapper>
                <Components.Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              <InputWrapper>
                <Components.Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <TogglePasswordButton
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </TogglePasswordButton>
              </InputWrapper>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              <Components.Button type="submit" disabled={isLoading}>
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Components.Button>
              <SocialLoginContainer>
                <SocialButton disabled>Google (Coming Soon)</SocialButton>
                <SocialButton disabled>Facebook (Coming Soon)</SocialButton>
              </SocialLoginContainer>
            </Components.Form>
          </Components.SignUpContainer>

          <Components.SignInContainer signinIn={signIn}>
            <Components.Form onSubmit={handleSignIn}>
              <Components.Title>Sign in</Components.Title>
              <InputWrapper>
                <Components.Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              <InputWrapper>
                <Components.Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <TogglePasswordButton
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </TogglePasswordButton>
              </InputWrapper>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              <CheckboxWrapper>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <CheckboxLabel htmlFor="rememberMe">Remember Me</CheckboxLabel>
              </CheckboxWrapper>
              <Components.Anchor href="#">Forgot your password?</Components.Anchor>
              <Components.Button type="submit" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Components.Button>
              <SocialLoginContainer>
                <SocialButton disabled>Google (Coming Soon)</SocialButton>
                <SocialButton disabled>Facebook (Coming Soon)</SocialButton>
              </SocialLoginContainer>
            </Components.Form>
          </Components.SignInContainer>

          <Components.OverlayContainer signinIn={signIn}>
            <Components.Overlay signinIn={signIn}>
              <Components.LeftOverlayPanel signinIn={signIn}>
                <Components.Title>Welcome Back!</Components.Title>
                <Components.Paragraph>
                  To keep connected with us please login with your personal info
                </Components.Paragraph>
                <Components.GhostButton onClick={() => toggle(true)}>
                  Sign In
                </Components.GhostButton>
              </Components.LeftOverlayPanel>

              <Components.RightOverlayPanel signinIn={signIn}>
                <Components.Title>Hello, Friend!</Components.Title>
                <Components.Paragraph>
                  Enter your personal details and start your journey with us
                </Components.Paragraph>
                <Components.GhostButton onClick={() => toggle(false)}>
                  Sign Up
                </Components.GhostButton>
              </Components.RightOverlayPanel>
            </Components.Overlay>
          </Components.OverlayContainer>
        </Components.Container>
      </Components.CenteredContainer>
    </>
  );
}

export default Login;