import React, { useState } from "react";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false); // State to track chat widget visibility
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  const toggleChat = () => {
    setIsOpen((prev) => !prev); // Toggle the chat widget visibility
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botMessage = { sender: "bot", text: "Thank you for your message. We'll get back to you shortly!" };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setInput("");
  };

  return (
    <div className="chat-widget">
      <button className="chat-toggle" onClick={toggleChat}>
        {isOpen ? "✖ Close" : "💬 Chat with us"}
      </button>
      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">Live Chat</div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
