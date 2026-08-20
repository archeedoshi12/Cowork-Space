import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '💺', title: 'Hot Desks', desc: 'Flexible desks available by the hour. Perfect for remote workers.' },
  { icon: '🏛️', title: 'Meeting Rooms', desc: 'Fully equipped rooms for teams of 2 to 20 people.' },
  { icon: '📅', title: 'Easy Booking', desc: 'Book in seconds. View real-time availability and manage bookings.' },
  { icon: '⚡', title: 'Instant Confirmation', desc: 'Get notified instantly when your booking is approved.' },
];

const STATS = [
  { value: '50+', label: 'Workspaces' },
  { value: '500+', label: 'Members' },
  { value: '99%', label: 'Uptime' },
  { value: '24/7', label: 'Access' },
];

export default function Home() {
  const { user, isAdmin } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>Your Workspace, Your Way</h1>
          <p>Book desks and meeting rooms in seconds. Real-time availability, instant confirmation, and seamless management.</p>
          <div className="hero-actions">
            <Link to="/spaces" className="btn btn-hero" style={{ background: 'white', color: 'var(--primary)' }}>
              Browse Spaces
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-hero btn-hero-outline">
                Get Started Free
              </Link>
            )}
            {user && (
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn btn-hero btn-hero-outline">
                {isAdmin ? 'Admin Dashboard' : 'My Bookings'}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)' }}>
        <div className="container">
          <div className="grid grid-4" style={{ padding: '2rem 0' }}>
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Everything You Need
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '2.5rem' }}>
            A complete workspace booking solution for modern teams
          </p>
          <div className="grid grid-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ background: 'var(--primary-light)', padding: '4rem 0', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
              Ready to get started?
            </h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
              Join hundreds of professionals who book their workspace with CoWork Space.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
          </div>
        </section>
      )}
    </div>
  );
}
