import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadCartItems();
    }, []);

    const loadCartItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/kosar', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(response.data);
            calculateTotal(response.data);
        } catch (error) {
            console.error('Hiba a kosár betöltésekor:', error);
        }
    };

    const calculateTotal = (items) => {
        const sum = items.reduce((acc, item) => {
            const price = item.akcio_ar || item.ar;
            return acc + (price * item.mennyiseg);
        }, 0);
        setTotal(sum);
    };

    const updateQuantity = async (termekId, mennyiseg) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:3000/api/kosar/update', {
                termekId,
                mennyiseg
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadCartItems();
        } catch (error) {
            console.error('Hiba a mennyiség módosításakor:', error);
        }
    };

    const removeItem = async (termekId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/kosar/remove/${termekId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadCartItems();
        } catch (error) {
            console.error('Hiba a termék törlésekor:', error);
        }
    };

    const checkout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/api/rendelesek/create', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems([]);
            setTotal(0);
            alert('Rendelés sikeresen leadva!');
        } catch (error) {
            console.error('Hiba a rendelés leadásakor:', error);
            alert('Hiba történt a rendelés során!');
        }
    };

    return (
        <div className="cart-container">
            <h2>Kosár</h2>
            {cartItems.length === 0 ? (
                <p>A kosár üres</p>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.termek_id} className="cart-item">
                                <img src={item.kep_url || '/placeholder.jpg'} alt={item.nev} />
                                <div className="item-details">
                                    <h3>{item.nev}</h3>
                                    <p>{item.leiras}</p>
                                    <div className="price-details">
                                        {item.akcio_ar ? (
                                            <>
                                                <span className="original-price">{item.ar} Ft</span>
                                                <span className="sale-price">{item.akcio_ar} Ft</span>
                                            </>
                                        ) : (
                                            <span className="price">{item.ar} Ft</span>
                                        )}
                                    </div>
                                </div>
                                <div className="quantity-controls">
                                    <button 
                                        onClick={() => updateQuantity(item.termek_id, item.mennyiseg - 1)}
                                        disabled={item.mennyiseg <= 1}
                                    >
                                        -
                                    </button>
                                    <span>{item.mennyiseg}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.termek_id, item.mennyiseg + 1)}
                                        disabled={item.mennyiseg >= item.keszlet}
                                    >
                                        +
                                    </button>
                                </div>
                                <button 
                                    className="remove-button"
                                    onClick={() => removeItem(item.termek_id)}
                                >
                                    Törlés
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <div className="total">
                            <span>Összesen:</span>
                            <span>{total} Ft</span>
                        </div>
                        <button 
                            className="checkout-button"
                            onClick={checkout}
                        >
                            Rendelés leadása
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
