import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components';

function Navbar() {
  const navigate = useNavigate();
  
  return (
    <nav className="border-b border-border bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-semibold text-lg hover:text-primary transition-colors">
            TechSwap
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/buy" className="text-sm font-medium hover:text-primary transition-colors">Buy</Link>
          <Link to="/sell" className="text-sm font-medium hover:text-primary transition-colors">Sell</Link>
          <Link to="/problem-solver" className="text-sm font-medium hover:text-primary transition-colors">Problem Solver</Link>
          <Link to="/nearby" className="text-sm font-medium hover:text-primary transition-colors">Nearby</Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
            Profile
          </Link>
          {!localStorage.getItem('token') && (
            <>
              <Link to="/login" className="text-xs font-medium mr-2 hover:text-primary transition-colors">Login</Link>
              <Link to="/register" className="text-xs font-medium hover:text-primary transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;