import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components.css';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-text">WebShop</span>
        </Link>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="menu-icon"></span>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-start">
            <Link to="/" className="nav-link">Főoldal</Link>
            <Link to="/products" className="nav-link">Termékek</Link>
            <div className="nav-dropdown">
              <button className="nav-link dropdown-trigger">Kategóriák</button>
              <div className="dropdown-menu">
                <Link to="/category/electronics" className="dropdown-item">Elektronika</Link>
                <Link to="/category/clothing" className="dropdown-item">Ruházat</Link>
                <Link to="/category/books" className="dropdown-item">Könyvek</Link>
              </div>
            </div>
          </div>

          <div className="navbar-end">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Keresés..."
                className="search-input"
              />
              <button className="search-button">
                <i className="fas fa-search"></i>
              </button>
            </div>
            <div className="navbar-end">
              {!token ? (
                <>
                  <Link to="/login" className="nav-link">Bejelentkezés</Link>
                  <Link to="/register" className="nav-link">Regisztráció</Link>
                </>
              ) : (
                <button onClick={handleLogout} className="nav-link">Kijelentkezés</button>
              )}
            </div>
            {token ? (
              <>
                <Link to="/cart" className="nav-link">Kosár</Link>
                <Link to="/profile" className="nav-link">Profil</Link>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
