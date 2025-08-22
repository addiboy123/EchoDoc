import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="form-container">
      {/* ADD THIS BACK BUTTON LINK */}
      <Link to="/" className="back-button">
        <i className="ph ph-arrow-left"></i>
        <span>Back to Home</span>
      </Link>

      <h2>Welcome Back to EchoDoc</h2>
        <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <div className="message error">{error}</div>}
      <p className="form-switch">Don't have an account? <Link to="/signup">Sign up here</Link>.</p>
    </div>
  );
};

export default LoginPage;