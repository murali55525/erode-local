import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaUserCircle, FaShoppingCart, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./Navbar.css";

const API_BASE_URL = "http://localhost:5000";

const Navbar = ({ isLoggedIn, user: propUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [user, setUser] = useState(propUser);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Static categories organized into columns
  const categories = [
    ["Lipstick", "Nail Polish", "Soap", "Shampoo", "Perfumes"],
    ["Bag Items", "Necklace", "Bangles", "Steads", "Hip Band"],
    ["Earrings", "Cosmetic Makeup", "Slippers", "Shoes", "Watches"],
    ["Bindi", "Key Chains", "Gift Items", "Rental Jewelry", "Skin Care"],
    ["Bottles", "Hair Accessories", "Face Masks", "Jewelry Sets", "Rings"]
  ];

  const handleLogoutClick = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    onLogout();
    navigate("/login");
    setUser(null);
    setIsDropdownOpen(false);
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
  }, [navigate, onLogout]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isLoggedIn) {
        setUser(null);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        handleLogoutClick();
        return;
      }

      try {
        const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        setUser({
          ...userData,
          name: userData.name || "User",
          email: userData.email || "",
          profilePicture: userData.profilePicture || "https://via.placeholder.com/150",
          isEmailVerified: userData.isEmailVerified || false,
        });
      } catch (err) {
        console.error("Error fetching user:", err.message);
        if (err.message.includes("401") || err.message.includes("403")) {
          handleLogoutClick();
        }
      }
    };

    fetchUserDetails();
  }, [isLoggedIn, handleLogoutClick]);

  useEffect(() => {
    const fetchCartDetails = async () => {
      if (!isLoggedIn) {
        setCartItems(0);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch cart details");

        const data = await response.json();
        setCartItems(data.items?.length || 0);
      } catch (err) {
        console.error("Error fetching cart details:", err.message);
        setCartItems(0);
      }
    };

    fetchCartDetails();
  }, [isLoggedIn]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setIsDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
    setIsUserDropdownOpen(false);
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setIsUserDropdownOpen((prev) => !prev);
    setIsDropdownOpen(false);
  };

  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="logo">New Erode Fancy</h1>
        <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? "✖" : "☰"}
        </button>
        <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <li>
            <Link to="/home" className="nav-link" onClick={handleLinkClick}>
              Home
            </Link>
          </li>

          <li className="navbar-dropdown" ref={dropdownRef}>
            <span className="nav-link dropdown-toggle" onClick={toggleDropdown}>
              Categories
              {isDropdownOpen ? <FaChevronUp className="dropdown-icon" /> : <FaChevronDown className="dropdown-icon" />}
            </span>
            <div className={`navbar-dropdown-content ${isDropdownOpen ? "show" : ""}`}>
              <div className="dropdown-grid">
                {categories.map((column, colIndex) => (
                  <div key={colIndex} className="dropdown-column">
                    {column.map((category, index) => (
                      <div key={`${colIndex}-${index}`} className="dropdown-item">
                        <Link
                          to={`/shop?category=${encodeURIComponent(category.toLowerCase())}`}
                          onClick={handleLinkClick}
                          className="dropdown-link"
                        >
                          {category}
                        </Link>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </li>

          <li>
            <Link to="/shop" className="nav-link" onClick={handleLinkClick}>
              Shop
            </Link>
          </li>
          <li>
            <Link to="/about" className="nav-link" onClick={handleLinkClick}>
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" className="nav-link" onClick={handleLinkClick}>
              Contact
            </Link>
          </li>
        </ul>
        <div className="navbar-right">
          {isLoggedIn && (
            <>
              <div className="user-section" ref={userDropdownRef}>
                <span className="nav-link user-name" onClick={toggleUserDropdown}>
                  <FaUser />
                  {user?.name || "User"}
                </span>
                <div className={`user-dropdown-content ${isUserDropdownOpen ? "show" : ""}`}>
                  <div className="user-dropdown-item user-info">
                    <div className="user-details">
                      <img src={user?.profilePicture} alt="Profile" className="profile-picture" />
                      <span className="user-detail"><strong>{user?.name}</strong></span>
                      <span className="user-detail email">{user?.email}</span>
                    </div>
                  </div>
                  <div className="user-dropdown-item">
                    <Link to="/profile" className="dropdown-link" onClick={handleLinkClick}>
                      <FaUserCircle /> Profile
                    </Link>
                  </div>
                  <div className="user-dropdown-item">
                    <Link to="/orders" className="dropdown-link" onClick={handleLinkClick}>
                      🛒 Order History
                    </Link>
                  </div>
                  <div className="user-dropdown-item">
                    <Link to="/wishlist" className="dropdown-link" onClick={handleLinkClick}>
                      ❤️ Wishlist
                    </Link>
                  </div>
                  <div className="user-dropdown-item">
                    <Link to="/settings" className="dropdown-link" onClick={handleLinkClick}>
                      ⚙️ Settings
                    </Link>
                  </div>
                  <div className="user-dropdown-item">
                    <button onClick={handleLogoutClick} className="logout-btn">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              </div>
              <Link to="/cart" className="nav-link cart-icon" onClick={handleLinkClick}>
                <FaShoppingCart />
                {cartItems > 0 && <span className="cart-count">{cartItems}</span>}
              </Link>
            </>
          )}
          {!isLoggedIn && (
            <Link to="/login" className="nav-link" onClick={handleLinkClick}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;