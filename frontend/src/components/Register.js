import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    jelszo: '',
    vezeteknev: '',
    keresztnev: '',
    telefon: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3000/api/auth/register', formData);
      navigate('/login', { state: { message: 'Sikeres regisztráció! Most már bejelentkezhet.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Hiba történt a regisztráció során');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Regisztráció</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="jelszo">Jelszó</label>
            <input
              type="password"
              id="jelszo"
              name="jelszo"
              value={formData.jelszo}
              onChange={handleChange}
              required
              className="form-control"
              minLength="6"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vezeteknev">Vezetéknév</label>
              <input
                type="text"
                id="vezeteknev"
                name="vezeteknev"
                value={formData.vezeteknev}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="keresztnev">Keresztnév</label>
              <input
                type="text"
                id="keresztnev"
                name="keresztnev"
                value={formData.keresztnev}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="telefon">Telefonszám</label>
            <input
              type="tel"
              id="telefon"
              name="telefon"
              value={formData.telefon}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
