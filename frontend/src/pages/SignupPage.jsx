import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup, loading, error } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        signup(name, email, password);
    };

    return (
    <div className="form-container">
      {/* ADD THIS BACK BUTTON LINK */}
      <Link to="/" className="back-button">
        <i className="ph ph-arrow-left"></i>
        <span>Back to Home</span>
      </Link>
      
      <h2>Create Your EchoDoc Account</h2>
        <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
            </form>
      {error && <div className="message error">{error}</div>}
      <p className="form-switch">Already have an account? <Link to="/login">Login here</Link>.</p>
    </div>
  );
};

export default SignupPage;