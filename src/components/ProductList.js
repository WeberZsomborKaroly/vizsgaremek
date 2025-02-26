import React, { useState, useEffect } from 'react';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // TODO: Itt kell majd a backend API-t meghívni
    // Példa termékek egyelőre
    setProducts([
      {
        id: 1,
        name: 'Termék 1',
        price: 9999,
        image: 'https://via.placeholder.com/200',
        description: 'Termék 1 leírása'
      },
      {
        id: 2,
        name: 'Termék 2',
        price: 19999,
        image: 'https://via.placeholder.com/200',
        description: 'Termék 2 leírása'
      },
      // További termékek...
    ]);
  }, []);

  const addToCart = (product) => {
    // TODO: Kosárhoz adás funkció implementálása
    console.log('Kosárhoz adva:', product);
  };

  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          <p className="price">{product.price.toLocaleString()} Ft</p>
          <p className="description">{product.description}</p>
          <button onClick={() => addToCart(product)} className="add-to-cart-btn">
            <i className="fas fa-cart-plus"></i> Kosárba
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
