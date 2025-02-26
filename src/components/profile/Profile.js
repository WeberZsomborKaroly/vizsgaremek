import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        vezeteknev: '',
        keresztnev: '',
        telefon: '',
        ceg_nev: '',
        adoszam: '',
        szamlazasi_cim: '',
        szallitasi_cim: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        loadUserData();
        loadOrders();
    }, []);

    const loadUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/felhasznalo/profil', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            setFormData(response.data);
        } catch (error) {
            setMessage({ text: 'Hiba történt az adatok betöltésekor', type: 'error' });
        }
    };

    const loadOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/felhasznalo/rendelesek', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            setMessage({ text: 'Hiba történt a rendelések betöltésekor', type: 'error' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/felhasznalo/profil', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: 'Profil sikeresen frissítve!', type: 'success' });
            setEditMode(false);
            loadUserData();
        } catch (error) {
            setMessage({ text: 'Hiba történt a profil mentésekor', type: 'error' });
        }
    };

    return (
        <div className="profile-container">
            <h2>Fiókom</h2>
            
            {message.text && (
                <div className={`alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-section">
                <h3>Személyes adatok</h3>
                {!editMode ? (
                    <div className="profile-details">
                        <p><strong>Név:</strong> {user?.vezeteknev} {user?.keresztnev}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Telefon:</strong> {user?.telefon}</p>
                        {user?.ceg_nev && (
                            <>
                                <p><strong>Cégnév:</strong> {user.ceg_nev}</p>
                                <p><strong>Adószám:</strong> {user.adoszam}</p>
                            </>
                        )}
                        <p><strong>Számlázási cím:</strong> {user?.szamlazasi_cim}</p>
                        <p><strong>Szállítási cím:</strong> {user?.szallitasi_cim}</p>
                        <button onClick={() => setEditMode(true)} className="edit-button">
                            Adatok szerkesztése
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="profile-form">
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
                            <label>Telefon:</label>
                            <input
                                type="tel"
                                name="telefon"
                                value={formData.telefon}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Cégnév (opcionális):</label>
                            <input
                                type="text"
                                name="ceg_nev"
                                value={formData.ceg_nev}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Adószám (opcionális):</label>
                            <input
                                type="text"
                                name="adoszam"
                                value={formData.adoszam}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Számlázási cím:</label>
                            <textarea
                                name="szamlazasi_cim"
                                value={formData.szamlazasi_cim}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Szállítási cím:</label>
                            <textarea
                                name="szallitasi_cim"
                                value={formData.szallitasi_cim}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-buttons">
                            <button type="submit" className="save-button">Mentés</button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setEditMode(false);
                                    setFormData(user);
                                }} 
                                className="cancel-button"
                            >
                                Mégse
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="orders-section">
                <h3>Korábbi rendelések</h3>
                {orders.length > 0 ? (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <span className="order-number">Rendelés #{order.rendeles_szam}</span>
                                    <span className={`order-status ${order.statusz}`}>{order.statusz}</span>
                                </div>
                                <div className="order-details">
                                    <p><strong>Dátum:</strong> {new Date(order.letrehozva).toLocaleDateString('hu-HU')}</p>
                                    <p><strong>Összeg:</strong> {order.osszeg.toLocaleString()} Ft</p>
                                    <p><strong>Szállítási cím:</strong> {order.szallitasi_cim}</p>
                                </div>
                                <div className="order-items">
                                    {order.termekek.map(item => (
                                        <div key={item.id} className="order-item">
                                            <span>{item.nev}</span>
                                            <span>{item.mennyiseg} db</span>
                                            <span>{item.egysegar.toLocaleString()} Ft/db</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-orders">Még nincsenek korábbi rendelések.</p>
                )}
            </div>
        </div>
    );
};

export default Profile;
