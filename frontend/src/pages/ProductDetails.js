import React from "react";
import { useParams } from "react-router-dom";
import products from "../data/products";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));

  return (
    <div className="product-details">
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <h2>${product.price}</h2>
    </div>
  );
};

export default ProductDetails;
