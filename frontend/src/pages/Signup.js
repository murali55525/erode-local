import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const AuthContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 90%;
  max-width: 400px;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
`;

const AuthBox = styled.div`
  padding: 20px;
  width: 100%;
`;

const AuthTitle = styled.h1`
  font-weight: bold;
  margin: 0;
  text-align: center;
`;

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Input = styled.input`
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  width: 100%;
`;

const AuthButton = styled.button`
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
  &:active {
    transform: scale(0.95);
  }
  &:focus {
    outline: none;
  }
  &:disabled {
    background-color: #ccc;
    border-color: #ccc;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
`;

const SwitchText = styled.p`
  text-align: center;
  margin-top: 20px;
`;

const SwitchLink = styled.span`
  color: #ff4b2b;
  cursor: pointer;
  font-weight: bold;
`;

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);
        navigate("/");
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthBox>
        <AuthTitle>Sign Up</AuthTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <AuthForm onSubmit={handleSignup}>
          <InputGroup>
            <label htmlFor="name">Name</label>
            <Input id="name" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </InputGroup>
          <InputGroup>
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </InputGroup>
          <InputGroup>
            <label htmlFor="password">Password</label>
            <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </InputGroup>
          <AuthButton type="submit" disabled={loading}>{loading ? "Signing Up..." : "Sign Up"}</AuthButton>
        </AuthForm>
        <SwitchText>
          Already have an account? <SwitchLink onClick={() => navigate("/")}>Log In</SwitchLink>
        </SwitchText>
      </AuthBox>
    </AuthContainer>
  );
};

export default Signup;
