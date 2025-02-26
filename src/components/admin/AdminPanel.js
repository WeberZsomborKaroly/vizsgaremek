import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        nev: '',
        leiras: '',
        ar: '',
        akcio_ar: '',
        keszlet: '',
        kategoria: '',
        kep_url: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/termekek', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Hiba a termékek betöltésekor:', error);
        }
    };

    const handleInputChange = (e, isNewProduct = false) => {
        const { name, value } = e.target;
        if (isNewProduct) {
            setNewProduct(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setEditingProduct(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageUpload = async (e, productId = null) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/admin/upload-image', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (productId) {
                setEditingProduct(prev => ({
                    ...prev,
                    kep_url: response.data.imageUrl
                }));
            } else {
                setNewProduct(prev => ({
                    ...prev,
                    kep_url: response.data.imageUrl
                }));
            }
        } catch (error) {
            console.error('Hiba a kép feltöltésekor:', error);
        }
    };

    const addProduct = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/admin/termekek', newProduct, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewProduct({
                nev: '',
                leiras: '',
                ar: '',
                akcio_ar: '',
                keszlet: '',
                kategoria: '',
                kep_url: ''
            });
            loadProducts();
        } catch (error) {
            console.error('Hiba a termék hozzáadásakor:', error);
        }
    };

    const updateProduct = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/termekek/${editingProduct.id}`, editingProduct, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingProduct(null);
            loadProducts();
        } catch (error) {
            console.error('Hiba a termék frissítésekor:', error);
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Biztosan törölni szeretnéd ezt a terméket?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/admin/termekek/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                loadProducts();
            } catch (error) {
                console.error('Hiba a termék törlésekor:', error);
            }
        }
    };

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            
            <div className="new-product-form">
                <h3>Új termék hozzáadása</h3>
                <input
                    type="text"
                    name="nev"
                    placeholder="Termék neve"
                    value={newProduct.nev}
                    onChange={(e) => handleInputChange(e, true)}
                />
                <textarea
                    name="leiras"
                    placeholder="Termék leírása"
                    value={newProduct.leiras}
                    onChange={(e) => handleInputChange(e, true)}
                />
                <input
                    type="number"
                    name="ar"
                    placeholder="Ár"
                    value={newProduct.ar}
                    onChange={(e) => handleInputChange(e, true)}
                />
                <input
                    type="number"
                    name="akcio_ar"
                    placeholder="Akciós ár (opcionális)"
                    value={newProduct.akcio_ar}
                    onChange={(e) => handleInputChange(e, true)}
                />
                <input
                    type="number"
                    name="keszlet"
                    placeholder="Készlet"
                    value={newProduct.keszlet}
                    onChange={(e) => handleInputChange(e, true)}
                />
                <select
                    name="kategoria"
                    value={newProduct.kategoria}
                    onChange={(e) => handleInputChange(e, true)}
                >
                    <option value="">Válassz kategóriát</option>
                    <option value="Elektronika">Elektronika</option>
                    <option value="Ruházat">Ruházat</option>
                    <option value="Kiegészítők">Kiegészítők</option>
                </select>
                <input
                    type="file"
                    onChange={(e) => handleImageUpload(e)}
                    accept="image/*"
                />
                <button onClick={addProduct}>Termék hozzáadása</button>
            </div>

            <div className="products-list">
                <h3>Termékek kezelése</h3>
                {products.map(product => (
                    <div key={product.id} className="product-item">
                        {editingProduct && editingProduct.id === product.id ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    name="nev"
                                    value={editingProduct.nev}
                                    onChange={handleInputChange}
                                />
                                <textarea
                                    name="leiras"
                                    value={editingProduct.leiras}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="number"
                                    name="ar"
                                    value={editingProduct.ar}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="number"
                                    name="akcio_ar"
                                    value={editingProduct.akcio_ar}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="number"
                                    name="keszlet"
                                    value={editingProduct.keszlet}
                                    onChange={handleInputChange}
                                />
                                <select
                                    name="kategoria"
                                    value={editingProduct.kategoria}
                                    onChange={handleInputChange}
                                >
                                    <option value="Elektronika">Elektronika</option>
                                    <option value="Ruházat">Ruházat</option>
                                    <option value="Kiegészítők">Kiegészítők</option>
                                </select>
                                <input
                                    type="file"
                                    onChange={(e) => handleImageUpload(e, product.id)}
                                    accept="image/*"
                                />
                                <div className="edit-buttons">
                                    <button onClick={updateProduct}>Mentés</button>
                                    <button onClick={() => setEditingProduct(null)}>Mégse</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <img src={product.kep_url || '/placeholder.jpg'} alt={product.nev} />
                                <div className="product-info">
                                    <h4>{product.nev}</h4>
                                    <p>{product.leiras}</p>
                                    <p>Ár: {product.ar} Ft</p>
                                    {product.akcio_ar && <p>Akciós ár: {product.akcio_ar} Ft</p>}
                                    <p>Készlet: {product.keszlet} db</p>
                                    <p>Kategória: {product.kategoria}</p>
                                </div>
                                <div className="action-buttons">
                                    <button onClick={() => setEditingProduct(product)}>Szerkesztés</button>
                                    <button onClick={() => deleteProduct(product.id)}>Törlés</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPanel;
