import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  className = '',
}) => {
  const startItem = pageSize ? (page - 1) * pageSize + 1 : undefined;
  const endItem = pageSize && totalItems ? Math.min(page * pageSize, totalItems) : undefined;

  const renderPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page, '...', totalPages);
      }
    }

    return pages.map((p, idx) => {
      if (typeof p === 'string') {
        return (
          <span key={`ellipsis-${idx}`} className="ui-pagination-ellipsis" style={{ padding: '0 4px', color: 'var(--color-slate-400)' }}>
            ...
          </span>
        );
      }
      return (
        <button
          key={p}
          type="button"
          className={`ui-pagination-btn ${p === page ? 'ui-pagination-btn--active' : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className={`ui-pagination ${className}`}>
      <div className="ui-pagination-info">
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span>
            Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
          </span>
        )}
      </div>
      <div className="ui-pagination-controls">
        <button
          type="button"
          className="ui-pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {renderPages()}
        <button
          type="button"
          className="ui-pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
