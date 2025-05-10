import React from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const OrderModal = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl relative w-full max-w-md">
        <div className="flex flex-col items-center">
          <FaCheckCircle className="text-6xl text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">Your order ID: {order._id}</p>
          <div className="bg-gray-50 w-full p-4 rounded-lg mb-4">
            <p className="font-medium text-gray-700">Order Summary:</p>
            <p className="text-gray-600">Total Amount: ₹{order.totalAmount}</p>
            <p className="text-gray-600">Items: {order.items.length}</p>
            <p className="text-gray-600">Delivery: {order.deliveryType}</p>
          </div>
          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default OrderModal;
