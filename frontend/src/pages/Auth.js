import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";

const clientId = "118179755200-u2f3rt2n4oq85mmm6hja4qpqu3cl83ts.apps.googleusercontent.com";

const Container = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 678px;
  max-width: 100%;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.6s ease-in-out;
`;

const Box = styled.div`
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  font-weight: bold;
  margin: 0 0 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
`;

const Button = styled.button`
  border-radius: 20px;
  border: 1px solid #ff4b2b;
  background-color: #ff4b2b;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
  cursor: pointer;
  &:active {
    transform: scale(0.95);
  }
  &:focus {
    outline: none;
  }
`;

const ToggleText = styled.p`
  margin-top: 20px;
  color: #333;
  cursor: pointer;
  font-weight: bold;
`;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const toggleForm = () => setIsLogin(!isLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `http://localhost:5000/${isLogin ? "login" : "signup"}`;
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        alert(`${isLogin ? "Login" : "Signup"} successful!`);
        navigate("/home");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Container style={{ transform: `translateX(${isLogin ? "0" : "-100%"})` }}>
        <Box>
          <Title>{isLogin ? "Login" : "Sign Up"}</Title>
          <Form onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit">{isLogin ? "Login" : "Sign Up"}</Button>
          </Form>

          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const decoded = jwtDecode(credentialResponse.credential);
              localStorage.setItem("user", JSON.stringify(decoded));
              localStorage.setItem("isLoggedIn", "true");
              alert("Google Sign-In successful!");
              navigate("/home");
            }}
            onError={() => alert("Google Sign-In failed. Try again.")}
          />

          <ToggleText onClick={toggleForm}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </ToggleText>
        </Box>
      </Container>
    </GoogleOAuthProvider>
  );
};

export default Auth;
