import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/components.css';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    jelszo: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/bejelentkezes', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.felhasznalo.id);
      localStorage.setItem('userRole', response.data.felhasznalo.szerepkor);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.uzenet || 'Hiba történt a bejelentkezés során');
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="login-card card">
        <h2 className="login-title">Bejelentkezés</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="pelda@email.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="jelszo">Jelszó</label>
            <input
              type="password"
              id="jelszo"
              name="jelszo"
              className="form-control"
              value={formData.jelszo}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary login-button">
            Bejelentkezés
          </button>
        </form>
        <div className="login-footer">
          <p>Még nincs fiókod? <a href="/register" className="register-link">Regisztrálj most!</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
