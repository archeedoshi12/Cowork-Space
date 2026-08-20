import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { spacesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import BookingModal from '../components/BookingModal';

export default function SpaceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    spacesAPI.getById(id)
      .then(({ data }) => setSpace(data.data))
      .catch(() => navigate('/spaces'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!space) return null;

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-secondary btn-sm mb-2" onClick={() => navigate('/spaces')}>
          ← Back to Spaces
        </button>

        <div className="grid" style={{ gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
          {/* Main info */}
          <div>
            <div className="card mb-2">
              <div style={{ height: '240px', background: 'linear-gradient(135deg, var(--primary-light), #c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
                {space.type === 'desk' ? '💺' : '🏛️'}
              </div>
              <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{space.name}</h1>
                  <span className={`badge badge-${space.type}`}>
                    {space.type === 'meeting_room' ? 'Meeting Room' : 'Desk'}
                  </span>
                </div>
                <div className="flex gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                  <span className="text-sm text-muted">👥 Capacity: <strong>{space.capacity}</strong></span>
                  <span className="text-sm text-muted">💰 <strong>${space.pricePerHour}/hr</strong></span>
                </div>
                {space.description && <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>{space.description}</p>}
                <div>
                  <p className="text-sm font-semibold mb-1">Amenities:</p>
                  <div className="space-card-amenities">
                    {space.amenities?.map((a) => <span key={a} className="amenity-tag">{a}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontWeight: 600 }}>Availability Calendar</h2>
              </div>
              <div className="card-body">
                <AvailabilityCalendar spaceId={id} />
              </div>
            </div>
          </div>

          {/* Booking panel */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '80px' }}>
              <div className="card-body">
                <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>Book This Space</h2>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted">Price</span>
                  <span className="font-semibold">${space.pricePerHour}/hr</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted">Capacity</span>
                  <span className="font-semibold">{space.capacity} {space.capacity === 1 ? 'person' : 'people'}</span>
                </div>
                <hr style={{ borderColor: 'var(--gray-200)', margin: '1rem 0' }} />
                {user ? (
                  <button className="btn btn-primary w-full btn-lg" onClick={() => setShowBooking(true)}>
                    Book Now
                  </button>
                ) : (
                  <div>
                    <p className="text-sm text-muted text-center mb-2">Sign in to book this space</p>
                    <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>
                      Sign In to Book
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted text-center mt-2">
                  Bookings require admin approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal
          space={space}
          onClose={() => setShowBooking(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
