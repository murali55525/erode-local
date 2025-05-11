import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import * as Components from "./Components";
import styled, { keyframes } from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";// To decode Google ID token

// Animation and styled components remain unchanged
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

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
  font-family: "Poppins", sans-serif;
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
  color: #4169e1;
  font-size: 16px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
  margin: 5px 0 0 0;
  font-family: "Poppins", sans-serif;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
`;

const CheckboxLabel = styled.label`
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  color: #333;
  margin-left: 5px;
`;

const SocialLoginContainer = styled.div`
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
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
    email: localStorage.getItem("rememberedEmail") || "",
    password: "",
  });
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        onLoginSuccess(data.user, data.token);
        navigate("/home", { replace: true });
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

  // Handle Google Sign-In success
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      console.log('Received Google response:', credentialResponse);
      
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'include', // Add this line
        body: JSON.stringify({ 
          token: credentialResponse.credential,
          clientId: "118179755200-u2f3rt2n4oq85mmm6hja4qpqu3cl83ts.apps.googleusercontent.com"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error('Server error: ' + (response.statusText || 'Unknown error'));
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        
        onLoginSuccess(data.user, data.token);
        navigate("/home", { replace: true });
        showAlert("Successfully logged in with Google!", "success");
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      showAlert(error.message || "An error occurred during Google login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In failure
  const handleGoogleFailure = () => {
    showAlert("Google Sign-In failed", "error");
  };

  return (
    <GoogleOAuthProvider clientId="118179755200-u2f3rt2n4oq85mmm6hja4qpqu3cl83ts.apps.googleusercontent.com">
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
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap={false}
                  cookiePolicy={'single_host_origin'}
                  buttonText="Sign up with Google"
                  theme="outline"
                  size="large"
                  width="100%"
                />
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
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap={false}
                  cookiePolicy={'single_host_origin'}
                  buttonText="Sign in with Google"
                  theme="outline"
                  size="large"
                  width="100%"
                />
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
    </GoogleOAuthProvider>
  );
}

export default Login;