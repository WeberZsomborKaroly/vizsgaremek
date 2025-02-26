import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ setUser }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        jelszo: '',
        vezeteknev: '',
        keresztnev: '',
        telefon: ''
    });
    const [hibaUzenet, setHibaUzenet] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHibaUzenet('');

        try {
            const endpoint = isRegistering ? '/api/regisztracio' : '/api/bejelentkezes';
            const valasz = await axios.post(`http://localhost:5000${endpoint}`, formData);
            
            if (valasz.data.token) {
                localStorage.setItem('token', valasz.data.token);
                localStorage.setItem('user', JSON.stringify(valasz.data.felhasznalo));
                setUser(valasz.data.felhasznalo);
            }
        } catch (error) {
            setHibaUzenet(error.response?.data?.uzenet || 
                (isRegistering ? 'Hiba történt a regisztráció során!' : 'Hibás email vagy jelszó!'));
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>{isRegistering ? 'Regisztráció' : 'Bejelentkezés'}</h2>
                <form onSubmit={handleSubmit}>
                    {isRegistering && (
                        <>
                            <div className="form-group">
                                <label>Vezetéknév:</label>
                                <input
                                    type="text"
                                    name="vezeteknev"
                                    value={formData.vezeteknev}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Keresztnév:</label>
                                <input
                                    type="text"
                                    name="keresztnev"
                                    value={formData.keresztnev}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Telefonszám:</label>
                                <input
                                    type="tel"
                                    name="telefon"
                                    value={formData.telefon}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label>Email cím:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Jelszó:</label>
                        <input
                            type="password"
                            name="jelszo"
                            value={formData.jelszo}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    {hibaUzenet && <div className="hiba-uzenet">{hibaUzenet}</div>}
                    <button type="submit" className="submit-button">
                        {isRegistering ? 'Regisztráció' : 'Bejelentkezés'}
                    </button>
                </form>
                <div className="switch-form">
                    <p>
                        {isRegistering ? 'Már van fiókod?' : 'Még nincs fiókod?'}
                        <button 
                            className="switch-button"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setHibaUzenet('');
                                setFormData({
                                    email: '',
                                    jelszo: '',
                                    vezeteknev: '',
                                    keresztnev: '',
                                    telefon: ''
                                });
                            }}
                        >
                            {isRegistering ? 'Bejelentkezés' : 'Regisztráció'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
