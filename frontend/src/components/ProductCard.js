import React from 'react';

const ProductCard = ({ image, title, description }) => {
  return (
    <div className="product-card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="cta-btn">View Details</button>
    </div>
  );
};

export default ProductCard;