import React from 'react';
import { Link } from 'react-router-dom';

const SPACE_ICONS = { desk: '💺', meeting_room: '🏛️' };

export default function SpaceCard({ space }) {
  return (
    <div className="card space-card">
      <div className="space-card-img">
        <span>{SPACE_ICONS[space.type] || '🏢'}</span>
      </div>
      <div className="space-card-body">
        <h3 className="space-card-title">{space.name}</h3>
        <div className="space-card-meta">
          <span className={`badge badge-${space.type}`}>
            {space.type === 'meeting_room' ? 'Meeting Room' : 'Desk'}
          </span>
          <span className="text-sm text-muted">👥 {space.capacity} {space.capacity === 1 ? 'person' : 'people'}</span>
        </div>
        {space.description && (
          <p className="text-sm text-muted mb-2" style={{ lineHeight: 1.4 }}>{space.description}</p>
        )}
        <div className="space-card-amenities">
          {space.amenities?.slice(0, 4).map((a) => (
            <span key={a} className="amenity-tag">{a}</span>
          ))}
          {space.amenities?.length > 4 && (
            <span className="amenity-tag">+{space.amenities.length - 4} more</span>
          )}
        </div>
        <div className="space-card-footer">
          <div className="price">${space.pricePerHour}<span>/hr</span></div>
          <Link to={`/spaces/${space._id}`} className="btn btn-primary btn-sm">View Details</Link>
        </div>
      </div>
    </div>
  );
}
