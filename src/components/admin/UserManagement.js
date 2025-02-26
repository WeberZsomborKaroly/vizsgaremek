import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

const UserManagement = () => {
    const [felhasznalok, setFelhasznalok] = useState([]);
    const [hibaUzenet, setHibaUzenet] = useState('');
    const [sikeresUzenet, setSikeresUzenet] = useState('');

    useEffect(() => {
        fetchFelhasznalok();
    }, []);

    const fetchFelhasznalok = async () => {
        try {
            const token = localStorage.getItem('token');
            const valasz = await axios.get('http://localhost:5000/api/admin/felhasznalok', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFelhasznalok(valasz.data);
        } catch (error) {
            setHibaUzenet('Hiba történt a felhasználók betöltése során!');
        }
    };

    const handleSzerepkorValtas = async (id, currentIsAdmin) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/admin/felhasznalok/${id}/szerepkor`,
                { isAdmin: !currentIsAdmin },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            setSikeresUzenet('Szerepkör sikeresen módosítva!');
            setTimeout(() => setSikeresUzenet(''), 3000);
            
            // Frissítjük a felhasználók listáját
            fetchFelhasznalok();
        } catch (error) {
            setHibaUzenet(error.response?.data?.uzenet || 'Hiba történt a szerepkör módosítása során!');
            setTimeout(() => setHibaUzenet(''), 3000);
        }
    };

    return (
        <div className="user-management">
            <h2>Felhasználók kezelése</h2>
            
            {hibaUzenet && (
                <div className="alert error">
                    {hibaUzenet}
                </div>
            )}
            
            {sikeresUzenet && (
                <div className="alert success">
                    {sikeresUzenet}
                </div>
            )}

            <div className="user-list">
                <table>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Jelenlegi szerepkör</th>
                            <th>Admin jogosultság</th>
                        </tr>
                    </thead>
                    <tbody>
                        {felhasznalok.map((felhasznalo) => (
                            <tr key={felhasznalo.id}>
                                <td>{felhasznalo.email}</td>
                                <td>{felhasznalo.szerepkor}</td>
                                <td>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={felhasznalo.szerepkor === 'admin'}
                                            onChange={() => handleSzerepkorValtas(
                                                felhasznalo.id,
                                                felhasznalo.szerepkor === 'admin'
                                            )}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
