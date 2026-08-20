import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', cancelled: 'badge-cancelled' };

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await bookingsAPI.getMy(params);
      setBookings(data.data);
      setPagination(data.pagination);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingsAPI.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header flex justify-between items-center">
          <div>
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">Welcome back, {user?.name}</p>
          </div>
          <Link to="/spaces" className="btn btn-primary">+ New Booking</Link>
        </div>

        {/* Filter */}
        <div className="card mb-2">
          <div className="card-body" style={{ padding: '1rem 1.5rem' }}>
            <div className="flex gap-2 items-center">
              <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Filter by status:</label>
              {['', 'pending', 'approved', 'rejected', 'cancelled'].map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state card card-body">
            <div className="empty-state-icon">📅</div>
            <h3>No bookings found</h3>
            <p>Start by browsing available spaces</p>
            <Link to="/spaces" className="btn btn-primary mt-2">Browse Spaces</Link>
          </div>
        ) : (
          <>
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Space</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Admin Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id}>
                        <td>
                          <div className="font-semibold">{b.space?.name}</div>
                          <div className="text-xs text-muted">{b.space?.type === 'meeting_room' ? 'Meeting Room' : 'Desk'}</div>
                        </td>
                        <td>{b.date}</td>
                        <td>{b.startTime} – {b.endTime}</td>
                        <td><span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                        <td className="text-sm text-muted">{b.adminNote || '—'}</td>
                        <td>
                          {['pending', 'approved'].includes(b.status) && b.date >= today && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(b._id)}
                              disabled={cancelling === b._id}
                            >
                              {cancelling === b._id ? '...' : 'Cancel'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
