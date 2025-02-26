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

    return (
        <div className="cart-container">
            <h2>Kosár</h2>
            <ul>
                {cartItems.map(item => (
                    <li key={item.id}>{item.nev} - {item.mennyiseg} x {item.ar} Ft</li>
                ))}
            </ul>
            <h3>Összesen: {total} Ft</h3>
        </div>
    );
};

export default Cart;
