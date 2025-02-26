import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/products');
      console.log('Betöltött termékek:', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Hiba a termékek betöltése során:', error);
      setError('Hiba történt a termékek betöltése során');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Hiba a kategóriák betöltése során:', error);
    }
  };

  const addToCart = async (product) => {
    try {
      await axios.post('http://localhost:3001/api/cart/add', {
        termek_id: product.id,
        mennyiseg: 1
      });
      setError('Termék sikeresen hozzáadva a kosárhoz!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Hiba a kosárhoz adás során:', error);
      setError('Hiba történt a kosárhoz adás során.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.kategoria_id === parseInt(selectedCategory);
    const matchesSearch = product.nev.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <div className="loading">Termékek betöltése...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Keresés..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Összes
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id.toString() ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id.toString())}
            >
              {category.nev}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">Nincs találat a keresési feltételeknek megfelelően</div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={product.kep || 'http://localhost:3001/kepek/placeholder.jpg'} 
                  alt={product.nev}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'http://localhost:3001/kepek/placeholder.jpg';
                  }}
                />
                {product.akcios && (
                  <div className="discount-badge">Akciós!</div>
                )}
              </div>
              <div className="product-card-content">
                <h3 className="product-title">{product.nev}</h3>
                <p className="product-description">{product.leiras}</p>
                <div className="product-details">
                  {product.akcios ? (
                    <div className="price-container">
                      <span className="original-price">{product.ar} Ft</span>
                      <span className="discounted-price">{product.akcios_ar} Ft</span>
                    </div>
                  ) : (
                    <span className="product-price">{product.ar} Ft</span>
                  )}
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Kosárba
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
