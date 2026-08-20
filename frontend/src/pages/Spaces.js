import React, { useState, useEffect, useCallback } from 'react';
import { spacesAPI } from '../api';
import SpaceCard from '../components/SpaceCard';
import Pagination from '../components/Pagination';

export default function Spaces() {
  const [spaces, setSpaces] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', type: '', capacity: '', date: '', page: 1, limit: 9 });

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await spacesAPI.getAll(params);
      setSpaces(data.data);
      setPagination(data.pagination);
    } catch {
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchSpaces(); }, [fetchSpaces]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleReset = () => {
    setFilters({ search: '', type: '', capacity: '', date: '', page: 1, limit: 9 });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Browse Spaces</h1>
          <p className="page-subtitle">Find the perfect workspace for your needs</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search spaces..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-control" value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
              <option value="">All Types</option>
              <option value="desk">Desk</option>
              <option value="meeting_room">Meeting Room</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Min. Capacity</label>
            <input
              type="number"
              className="form-control"
              placeholder="Any"
              min={1}
              value={filters.capacity}
              onChange={(e) => handleFilterChange('capacity', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Available On</label>
            <input
              type="date"
              className="form-control"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : spaces.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No spaces found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-2">
              Showing {spaces.length} of {pagination?.total} spaces
            </p>
            <div className="grid grid-3">
              {spaces.map((space) => <SpaceCard key={space._id} space={space} />)}
            </div>
            <Pagination pagination={pagination} onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))} />
          </>
        )}
      </div>
    </div>
  );
}
