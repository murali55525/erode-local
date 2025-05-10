import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './app/store';
import { logout, loginSuccess } from './features/auth/authSlice';
import { CartProvider } from './pages/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';

import Home from './pages/Home';
import Shop from './pages/Shop';

import Cart from './pages/Cart';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Profile from './components/Profile';
import './App.css'; // Add this for global styles
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </Router>
    </Provider>
  );
}

const MainApp = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          dispatch(loginSuccess({ user: parsedUser, token }));
        } catch (error) {
          console.error('Error parsing user data:', error);
          dispatch(logout());
        }
      } else {
        dispatch(logout());
      }
    };

    initializeAuth();
  }, [dispatch]);

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    dispatch(loginSuccess({ user: userData, token }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    dispatch(logout());
  };

  const hideNavbarRoutes = ['/login', '/signup'];

  return (
    <div className="app-container">
      {!hideNavbarRoutes.includes(location.pathname) && (
        <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
      )}

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
          />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        
          <Route
            path="/home"
            element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/shop"
            element={isLoggedIn ? <Shop /> : <Navigate to="/login" replace />}
          />
          
          <Route
            path="/cart"
            element={isLoggedIn ? <Cart /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/about"
            element={isLoggedIn ? <AboutUs /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/contact"
            element={isLoggedIn ? <ContactUs /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<div>404: Page Not Found</div>} />
        </Routes>
      </main>

      {isLoggedIn && <Footer />}
    </div>
  );
};

export default App;