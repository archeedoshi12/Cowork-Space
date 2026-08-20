import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          🏢 <span>CoWork Space</span>
        </Link>
        <div className="navbar-nav">
          <NavLink to="/spaces" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span>Browse Spaces</span>
          </NavLink>
          {user ? (
            <>
              {isAdmin ? (
                <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <span>Admin Dashboard</span>
                </NavLink>
              ) : (
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <span>My Bookings</span>
                </NavLink>
              )}
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
              <span className="text-sm text-muted" style={{ padding: '0 0.5rem' }}>
                Hi, {user.name.split(' ')[0]}
              </span>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Login
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
