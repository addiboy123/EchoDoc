import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header>
            <nav className="container">
                <Link to="/dashboard" className="logo">EchoDoc 🔊</Link>
                <div className="nav-links">
                    {user && <span id="welcome-user">Welcome, {user.name}!</span>}
                    <button onClick={logout} className="btn btn-secondary">Logout</button>
                </div>
            </nav>
        </header>
    );
};

export default Header;