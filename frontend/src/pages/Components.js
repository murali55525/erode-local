import styled, { css, keyframes } from 'styled-components';

// Slide animation for overlay transition
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

export const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; // Full viewport height for vertical centering
  background-color: #f5f5f5; // Optional: light background for contrast
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }

  @media (max-width: 480px) {
    padding: 5px;
  }
`;

export const Container = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 678px;
  max-width: 90%; // Responsive width
  min-height: 400px;
  margin: 0 auto; // Center horizontally within CenteredContainer

  @media (max-width: 768px) {
    width: 90%;
    min-height: 600px; // Increased height for stacked layout on mobile
    margin: 0 auto; // Ensure horizontal centering on mobile
  }

  @media (max-width: 480px) {
    min-height: 500px; // Further adjust height for very small screens
  }
`;

export const SignUpContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
  ${props => props.signinIn !== true 
    ? css`
        transform: translateX(100%);
        opacity: 1;
        z-index: 5;
        animation: ${slideIn} 0.6s ease-in-out;
      `
    : css`
        transform: translateX(0);
        opacity: 0;
        animation: ${slideOut} 0.6s ease-in-out;
      `
  }

  @media (max-width: 768px) {
    width: 100%;
    position: relative;
    transform: none !important; // Override transform on mobile
    opacity: 1;
    z-index: 1;
    display: ${props => (props.signinIn ? 'none' : 'block')};
    height: 50%; // Half of the container height on mobile
    top: 50%; // Position at the bottom half on mobile
    background-color: #ff416c; // Match overlay color for consistency
  }
`;

export const SignInContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  z-index: 2;
  ${props => props.signinIn !== true 
    ? css`
        transform: translateX(100%);
        animation: ${slideOut} 0.6s ease-in-out;
      `
    : css`
        transform: translateX(0);
        animation: ${slideIn} 0.6s ease-in-out;
      `
  }

  @media (max-width: 768px) {
    width: 100%;
    position: relative;
    transform: none !important; // Override transform on mobile
    display: ${props => (props.signinIn ? 'block' : 'none')};
    height: 50%; // Half of the container height on mobile
    top: 0; // Position at the top half on mobile
    background-color: #ffffff; // Match the sign-in panel color
  }
`;

export const Form = styled.form`
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;

  @media (max-width: 768px) {
    padding: 0 20px;
    height: 100%; // Ensure full height on mobile
  }

  @media (max-width: 480px) {
    padding: 0 10px;
  }
`;

export const Title = styled.h1`
  font-weight: bold;
  margin: 0;
  font-size: 24px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const Input = styled.input`
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
  max-width: 300px;
  font-size: 16px;
  border-radius: 5px;

  @media (max-width: 480px) {
    max-width: 100%;
    font-size: 14px;
    padding: 10px 12px;
  }
`;

export const Button = styled.button`
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
  &:hover {
    background-color: #e03e1f;
  }

  @media (max-width: 480px) {
    padding: 10px 30px;
    font-size: 11px;
  }
`;

export const GhostButton = styled(Button)`
  background-color: transparent;
  border-color: #ffffff;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export const Anchor = styled.a`
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;

  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin: 10px 0;
  }
`;

export const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
  ${props => props.signinIn !== true ? `transform: translateX(-100%);` : null}

  @media (max-width: 768px) {
    display: none; // Hide overlay on smaller screens
  }
`;

export const Overlay = styled.div`
  background: #ff416c;
  background: -webkit-linear-gradient(to right, #ff4b2b, #ff416c);
  background: linear-gradient(to right, #ff4b2b, #ff416c);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  ${props => (props.signinIn !== true ? `transform: translateX(50%);` : null)}
`;

export const OverlayPanel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
`;

export const LeftOverlayPanel = styled(OverlayPanel)`
  transform: translateX(-20%);
  ${props => props.signinIn !== true ? `transform: translateX(0);` : null}
`;

export const RightOverlayPanel = styled(OverlayPanel)`
  right: 0;
  transform: translateX(0);
  ${props => props.signinIn !== true ? `transform: translateX(20%);` : null}
`;

export const Paragraph = styled.p`
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;

  @media (max-width: 480px) {
    font-size: 12px;
    margin: 15px 0 20px;
  }
`;