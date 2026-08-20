import React from 'react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;

  const getPages = () => {
    const arr = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) arr.push(i);
    return arr;
  };

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</button>
      {getPages()[0] > 1 && (
        <>
          <button className="page-btn" onClick={() => onPageChange(1)}>1</button>
          {getPages()[0] > 2 && <span style={{ padding: '0 0.25rem', color: 'var(--gray-400)' }}>…</span>}
        </>
      )}
      {getPages().map((p) => (
        <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      {getPages()[getPages().length - 1] < pages && (
        <>
          {getPages()[getPages().length - 1] < pages - 1 && <span style={{ padding: '0 0.25rem', color: 'var(--gray-400)' }}>…</span>}
          <button className="page-btn" onClick={() => onPageChange(pages)}>{pages}</button>
        </>
      )}
      <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === pages}>›</button>
    </div>
  );
}
