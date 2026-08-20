import React, { useState } from 'react';
import { bookingsAPI } from '../api';
import toast from 'react-hot-toast';

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0');
  return `${h}:00`;
});

export default function BookingModal({ space, onClose, onSuccess }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ date: today, startTime: '09:00', endTime: '10:00', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.endTime <= form.startTime) {
      setError('End time must be after start time');
      return;
    }
    setLoading(true);
    try {
      const { data } = await bookingsAPI.create({ spaceId: space._id, ...form });
      toast.success('Booking submitted! Awaiting approval.');
      onSuccess(data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Book {space.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                min={today}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <select className="form-control" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <select className="form-control" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Any special requirements..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="alert alert-info" style={{ marginBottom: 0 }}>
              <strong>Price estimate:</strong> ${space.pricePerHour}/hr × {
                (() => {
                  const [sh, sm] = form.startTime.split(':').map(Number);
                  const [eh, em] = form.endTime.split(':').map(Number);
                  const hrs = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
                  return hrs > 0 ? hrs.toFixed(1) : 0;
                })()
              } hr(s)
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
