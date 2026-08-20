import React, { useState, useEffect, useCallback } from 'react';
import { spacesAPI, bookingsAPI } from '../api';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', cancelled: 'badge-cancelled' };
const TABS = ['Bookings', 'Spaces', 'Maintenance'];

// ─── Space Form Modal ────────────────────────────────────────────────────────
function SpaceFormModal({ space, onClose, onSave }) {
  const [form, setForm] = useState(
    space || { name: '', type: 'desk', capacity: 1, pricePerHour: 10, amenities: '', description: '' }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        amenities: typeof form.amenities === 'string'
          ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean)
          : form.amenities,
        capacity: parseInt(form.capacity),
        pricePerHour: parseFloat(form.pricePerHour),
      };
      if (space) {
        await spacesAPI.update(space._id, payload);
        toast.success('Space updated');
      } else {
        await spacesAPI.create(payload);
        toast.success('Space created');
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save space');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{space ? 'Edit Space' : 'Add New Space'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="desk">Desk</option>
                  <option value="meeting_room">Meeting Room</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input type="number" min={1} className="form-control" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Price per Hour ($)</label>
              <input type="number" min={0} step={0.01} className="form-control" value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Amenities (comma-separated)</label>
              <input
                className="form-control"
                placeholder="WiFi, Projector, Whiteboard"
                value={Array.isArray(form.amenities) ? form.amenities.join(', ') : form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Space'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Maintenance Modal ───────────────────────────────────────────────────────
function MaintenanceModal({ spaces, onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ spaceId: spaces[0]?._id || '', date: today, startTime: '08:00', endTime: '18:00', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await bookingsAPI.createMaintenance(form);
      toast.success(`Maintenance block created. ${data.conflictsResolved} conflicting booking(s) auto-rejected.`);
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create maintenance block');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">🔧 Block Maintenance Window</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Space</label>
              <select className="form-control" value={form.spaceId} onChange={(e) => setForm({ ...form, spaceId: e.target.value })} required>
                {spaces.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input type="time" className="form-control" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input type="time" className="form-control" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows={2} placeholder="Reason for maintenance..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="alert alert-info" style={{ marginBottom: 0 }}>
              ⚠️ Any pending/approved bookings in this window will be auto-rejected.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-warning" disabled={loading}>{loading ? 'Blocking...' : 'Block Window'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Note Modal ────────────────────────────────────────────────────────
function AdminNoteModal({ action, bookingId, onClose, onDone }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (action === 'approve') {
        const { data } = await bookingsAPI.approve(bookingId, { adminNote: note });
        toast.success(`Booking approved. ${data.autoRejected} overlapping booking(s) auto-rejected.`);
      } else {
        await bookingsAPI.reject(bookingId, { adminNote: note });
        toast.success('Booking rejected');
      }
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{action === 'approve' ? '✅ Approve' : '❌ Reject'} Booking</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Admin Note (optional)</label>
              <textarea className="form-control" rows={3} placeholder="Add a note for the member..." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`} disabled={loading}>
              {loading ? '...' : action === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Bookings');
  const [bookings, setBookings] = useState([]);
  const [bookingPagination, setBookingPagination] = useState(null);
  const [bookingFilters, setBookingFilters] = useState({ status: 'pending', date: '', spaceId: '', page: 1 });
  const [spaces, setSpaces] = useState([]);
  const [spacePagination, setSpacePagination] = useState(null);
  const [spacePage, setSpacePage] = useState(1);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [spaceModal, setSpaceModal] = useState(null); // null | 'new' | space object
  const [maintenanceModal, setMaintenanceModal] = useState(false);
  const [actionModal, setActionModal] = useState(null); // { action, bookingId }

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const params = { ...bookingFilters, limit: 10 };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await bookingsAPI.getAll(params);
      setBookings(data.data);
      setBookingPagination(data.pagination);
    } catch { setBookings([]); }
    finally { setLoadingBookings(false); }
  }, [bookingFilters]);

  const fetchSpaces = useCallback(async () => {
    setLoadingSpaces(true);
    try {
      const { data } = await spacesAPI.getAll({ page: spacePage, limit: 10 });
      setSpaces(data.data);
      setSpacePagination(data.pagination);
    } catch { setSpaces([]); }
    finally { setLoadingSpaces(false); }
  }, [spacePage]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { fetchSpaces(); }, [fetchSpaces]);

  const handleDeleteSpace = async (id) => {
    if (!window.confirm('Deactivate this space?')) return;
    try {
      await spacesAPI.delete(id);
      toast.success('Space deactivated');
      fetchSpaces();
    } catch { toast.error('Failed to deactivate'); }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header flex justify-between items-center">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage spaces, bookings, and maintenance</p>
          </div>
          <div className="flex gap-1">
            <button className="btn btn-warning btn-sm" onClick={() => setMaintenanceModal(true)}>🔧 Maintenance</button>
            <button className="btn btn-primary btn-sm" onClick={() => setSpaceModal('new')}>+ Add Space</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab-btn${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>

        {/* ── Bookings Tab ── */}
        {activeTab === 'Bookings' && (
          <div>
            <div className="filters-bar">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={bookingFilters.status} onChange={(e) => setBookingFilters({ ...bookingFilters, status: e.target.value, page: 1 })}>
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={bookingFilters.date} onChange={(e) => setBookingFilters({ ...bookingFilters, date: e.target.value, page: 1 })} />
              </div>
              <div className="form-group">
                <label className="form-label">Space</label>
                <select className="form-control" value={bookingFilters.spaceId} onChange={(e) => setBookingFilters({ ...bookingFilters, spaceId: e.target.value, page: 1 })}>
                  <option value="">All Spaces</option>
                  {spaces.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <button className="btn btn-secondary" onClick={() => setBookingFilters({ status: 'pending', date: '', spaceId: '', page: 1 })}>Reset</button>
            </div>

            {loadingBookings ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : bookings.length === 0 ? (
              <div className="empty-state card card-body">
                <div className="empty-state-icon">📋</div>
                <h3>No bookings found</h3>
              </div>
            ) : (
              <>
                <div className="card">
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Space</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Type</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b._id}>
                            <td>
                              <div className="font-semibold">{b.member?.name}</div>
                              <div className="text-xs text-muted">{b.member?.email}</div>
                            </td>
                            <td>{b.space?.name}</td>
                            <td>{b.date}</td>
                            <td>{b.startTime} – {b.endTime}</td>
                            <td><span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                            <td>{b.isMaintenance ? <span className="badge badge-maintenance">Maintenance</span> : '—'}</td>
                            <td>
                              {b.status === 'pending' && !b.isMaintenance && (
                                <div className="flex gap-1">
                                  <button className="btn btn-success btn-sm" onClick={() => setActionModal({ action: 'approve', bookingId: b._id })}>✓</button>
                                  <button className="btn btn-danger btn-sm" onClick={() => setActionModal({ action: 'reject', bookingId: b._id })}>✗</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination
                  pagination={bookingPagination}
                  onPageChange={(p) => setBookingFilters({ ...bookingFilters, page: p })}
                />
              </>
            )}
          </div>
        )}

        {/* ── Spaces Tab ── */}
        {activeTab === 'Spaces' && (
          <div>
            {loadingSpaces ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : (
              <>
                <div className="card">
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Capacity</th>
                          <th>Price/hr</th>
                          <th>Amenities</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spaces.map((s) => (
                          <tr key={s._id}>
                            <td className="font-semibold">{s.name}</td>
                            <td><span className={`badge badge-${s.type}`}>{s.type === 'meeting_room' ? 'Meeting Room' : 'Desk'}</span></td>
                            <td>{s.capacity}</td>
                            <td>${s.pricePerHour}</td>
                            <td className="text-sm text-muted">{s.amenities?.slice(0, 3).join(', ')}{s.amenities?.length > 3 ? '...' : ''}</td>
                            <td><span className={`badge ${s.isActive ? 'badge-approved' : 'badge-cancelled'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                            <td>
                              <div className="flex gap-1">
                                <button className="btn btn-secondary btn-sm" onClick={() => setSpaceModal(s)}>Edit</button>
                                {s.isActive && <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSpace(s._id)}>Delete</button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination pagination={spacePagination} onPageChange={setSpacePage} />
              </>
            )}
          </div>
        )}

        {/* ── Maintenance Tab ── */}
        {activeTab === 'Maintenance' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted">View and manage maintenance blocks</p>
              <button className="btn btn-warning btn-sm" onClick={() => setMaintenanceModal(true)}>+ Add Maintenance Block</button>
            </div>
            <MaintenanceBookingsList />
          </div>
        )}
      </div>

      {/* Modals */}
      {(spaceModal === 'new' || (spaceModal && spaceModal._id)) && (
        <SpaceFormModal
          space={spaceModal === 'new' ? null : spaceModal}
          onClose={() => setSpaceModal(null)}
          onSave={fetchSpaces}
        />
      )}
      {maintenanceModal && (
        <MaintenanceModal
          spaces={spaces}
          onClose={() => setMaintenanceModal(false)}
          onSave={fetchBookings}
        />
      )}
      {actionModal && (
        <AdminNoteModal
          action={actionModal.action}
          bookingId={actionModal.bookingId}
          onClose={() => setActionModal(null)}
          onDone={fetchBookings}
        />
      )}
    </div>
  );
}

// ─── Maintenance Bookings List ───────────────────────────────────────────────
function MaintenanceBookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getAll({ isMaintenance: true, limit: 50 })
      .then(({ data }) => setBookings(data.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (bookings.length === 0) return (
    <div className="empty-state card card-body">
      <div className="empty-state-icon">🔧</div>
      <h3>No maintenance blocks</h3>
    </div>
  );

  return (
    <div className="card">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Space</th><th>Date</th><th>Time</th><th>Notes</th><th>Created By</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td className="font-semibold">{b.space?.name}</td>
                <td>{b.date}</td>
                <td>{b.startTime} – {b.endTime}</td>
                <td className="text-sm text-muted">{b.notes || '—'}</td>
                <td className="text-sm">{b.member?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
