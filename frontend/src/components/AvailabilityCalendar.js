import React, { useState, useEffect, useCallback } from 'react';
import { spacesAPI } from '../api';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0');
  return `${h}:00`;
});

export default function AvailabilityCalendar({ spaceId }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await spacesAPI.getAvailability(spaceId, date);
      setBookings(data.data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [spaceId, date]);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  const getSlotStatus = (hour) => {
    const booking = bookings.find(
      (b) => b.startTime <= hour && b.endTime > hour
    );
    if (!booking) return 'available';
    if (booking.isMaintenance) return 'maintenance';
    return booking.status === 'approved' ? 'booked' : 'booked';
  };

  const getSlotLabel = (hour) => {
    const status = getSlotStatus(hour);
    if (status === 'available') return '✓ Free';
    if (status === 'maintenance') return '🔧 Maint.';
    return '✗ Booked';
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="form-label" style={{ marginBottom: 0 }}>Select Date:</label>
        <input
          type="date"
          className="form-control"
          style={{ width: 'auto' }}
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="availability-grid">
            {HOURS.map((hour) => {
              const status = getSlotStatus(hour);
              return (
                <div key={hour} className={`time-slot ${status}`}>
                  <div style={{ fontWeight: 600 }}>{hour}</div>
                  <div>{getSlotLabel(hour)}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
            <span className="time-slot available" style={{ cursor: 'default', padding: '0.25rem 0.75rem' }}>✓ Available</span>
            <span className="time-slot booked" style={{ cursor: 'default', padding: '0.25rem 0.75rem' }}>✗ Booked</span>
            <span className="time-slot maintenance" style={{ cursor: 'default', padding: '0.25rem 0.75rem' }}>🔧 Maintenance</span>
          </div>
        </>
      )}
    </div>
  );
}
