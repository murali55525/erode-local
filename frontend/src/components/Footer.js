import React from "react";
import "./Footer.css";

const Footer = () => {
  // Function to handle image error and set fallback image
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = "https://dummyimage.com/50x50/cccccc/000000&text=Icon"; // Use a valid placeholder image
  };

  return (
    <footer>
      <img
        src="https://dummyimage.com/50x50/cccccc/000000&text=Icon"
        alt="Icon"
        onError={handleImageError} // Call handleImageError if the image fails to load
      />
      {/* Add other footer content */}
    </footer>
  );
};

export default Footer;
