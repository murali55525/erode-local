import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { FaUser, FaSignOutAlt, FaUserCircle, FaShoppingCart } from "react-icons/fa";

const API_BASE_URL = "https://render-1-ehkn.onrender.com";
const CART_API_BASE_URL = "https://render-1-ehkn.onrender.com";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const userDropdownRef = useRef(null);

  // Track scrolling to adjust transparency
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoutClick = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    dispatch(logout());
    navigate("/login");
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
  }, [dispatch, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCartDetails = async () => {
      if (!isLoggedIn) {
        setCartItems(0);
        return;
      }

      try {
        const response = await fetch(`${CART_API_BASE_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch cart details");
        const data = await response.json();
        setCartItems(data.items?.length || 0);
      } catch (error) {
        console.error("Error fetching cart details:", error);
        setCartItems(0);
      }
    };

    fetchCartDetails();
  }, [isLoggedIn]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setIsUserDropdownOpen(false);
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setIsUserDropdownOpen((prev) => !prev);
  };

  const handleLinkClick = () => {
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#234781]/80 backdrop-blur-md border-b border-[#234781]/20"
          : "bg-[#234781]/60 backdrop-blur-sm"
      } shadow-lg`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/home" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-white hover:text-blue-200 transition-colors">
              New Erode Fancy
            </h1>
          </Link>

          <button
            className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <span className="text-2xl">✖</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>

          <div
            className={`${
              isMenuOpen
                ? "block absolute top-16 left-0 right-0 bg-black/70 backdrop-blur-lg border-y border-white/10 shadow-lg p-4 md:p-0 md:shadow-none"
                : "hidden"
            } md:block md:flex-grow md:ml-6`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              {["Home", "Shop", "About", "Contact"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-blue-200 hover:bg-white/10 transition-colors"
                  onClick={handleLinkClick}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center space-x-2 px-3 py-2 rounded-full text-white hover:bg-white/10 transition-colors"
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="h-6 w-6 rounded-full object-cover border-2 border-white/20"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="100%" height="100%" fill="%23234781"/><text x="50%" y="50%" font-size="12" fill="white" text-anchor="middle" dy=".3em">${user.name?.charAt(0).toUpperCase() || "U"}</text></svg>`;
                        }}
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-[#234781] flex items-center justify-center text-white font-medium text-sm border-2 border-white/20">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <span>{user?.name || "User"}</span>
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-1 bg-black/50 backdrop-blur-lg border border-white/10">
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          {user?.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover border-2 border-white/20"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="100%" height="100%" fill="%23234781"/><text x="50%" y="50%" font-size="20" fill="white" text-anchor="middle" dy=".3em">${user.name?.charAt(0).toUpperCase() || "U"}</text></svg>`;
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#234781] flex items-center justify-center text-white font-medium border-2 border-white/20">
                              {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white/90">{user?.name}</span>
                            <span className="text-xs text-white/70">{user?.email}</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={handleLinkClick}
                      >
                        <div className="flex items-center space-x-2">
                          <FaUserCircle className="h-4 w-4" />
                          <span>Profile</span>
                        </div>
                      </Link>

                      <button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <FaSignOutAlt className="h-4 w-4" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <Link
                  to="/cart"
                  className="relative p-2 text-white hover:text-blue-200 transition-colors"
                >
                  <FaShoppingCart className="h-6 w-6" />
                  {cartItems > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      {cartItems}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;