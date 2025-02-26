import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Webshop</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/cart" className="navbar-item">
          <i className="fas fa-shopping-cart"></i>
          <span className="cart-count">0</span>
        </Link>
        <Link to="/login" className="navbar-item">
          <i className="fas fa-user"></i>
          Bejelentkezés
        </Link>
        <Link to="/register" className="navbar-item">
          Regisztráció
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
