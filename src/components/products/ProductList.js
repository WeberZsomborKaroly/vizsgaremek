import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        kategoria: '',
        minAr: '',
        maxAr: '',
        kereses: ''
    });

    useEffect(() => {
        loadProducts();
    }, [filters]);

    const loadProducts = async () => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`http://localhost:5000/api/termekek?${queryParams}`);
            setProducts(response.data);
        } catch (error) {
            console.error('Hiba a termékek betöltésekor:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addToCart = async (termekId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/kosar/add', {
                termekId,
                mennyiseg: 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Termék hozzáadva a kosárhoz!');
        } catch (error) {
            console.error('Hiba a kosárhoz adáskor:', error);
            alert('Hiba történt a kosárhoz adás során!');
        }
    };

    return (
        <div className="product-list-container">
            <div className="filters">
                <input
                    type="text"
                    name="kereses"
                    placeholder="Keresés..."
                    value={filters.kereses}
                    onChange={handleFilterChange}
                />
                <select
                    name="kategoria"
                    value={filters.kategoria}
                    onChange={handleFilterChange}
                >
                    <option value="">Minden kategória</option>
                    <option value="Elektronika">Elektronika</option>
                    <option value="Ruházat">Ruházat</option>
                    <option value="Kiegészítők">Kiegészítők</option>
                </select>
                <input
                    type="number"
                    name="minAr"
                    placeholder="Min. ár"
                    value={filters.minAr}
                    onChange={handleFilterChange}
                />
                <input
                    type="number"
                    name="maxAr"
                    placeholder="Max. ár"
                    value={filters.maxAr}
                    onChange={handleFilterChange}
                />
            </div>

            <div className="products-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <img src={product.kep_url || '/placeholder.jpg'} alt={product.nev} />
                        <h3>{product.nev}</h3>
                        <p className="description">{product.leiras}</p>
                        <div className="price-section">
                            {product.akcio_ar ? (
                                <>
                                    <span className="original-price">{product.ar} Ft</span>
                                    <span className="sale-price">{product.akcio_ar} Ft</span>
                                </>
                            ) : (
                                <span className="price">{product.ar} Ft</span>
                            )}
                        </div>
                        <button 
                            onClick={() => addToCart(product.id)}
                            disabled={product.keszlet === 0}
                        >
                            {product.keszlet > 0 ? 'Kosárba' : 'Elfogyott'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;
