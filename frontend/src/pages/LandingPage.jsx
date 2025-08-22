import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <>
      <header>
        <nav className="container">
          <Link to="/" className="logo">EchoDoc 🔊</Link>
          <div className="nav-links">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </div>
        </nav>
      </header>
      <main className="container hero">
        <h1>Turn Your Documents into Audiobooks. Instantly.</h1>
        <p>Upload any PDF, and our AI will convert it into high-quality audio for you to listen to anywhere, anytime.</p>
        <Link to="/signup" className="btn btn-primary btn-large">Get Started for Free</Link>
      </main>
      <footer>
        <div className="container">
            <p>&copy; 2025 EchoDoc. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;