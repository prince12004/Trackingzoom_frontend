'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export interface Column<T> {
  header: string;
  key: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { _id: string }>({
  columns,
  rows,
  loading,
  onRowClick,
  emptyLabel = 'No records found',
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {columns.map((col) => (
                <th key={col.key} className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-gray-400">
                  <Inbox className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  {emptyLabel}
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row, i) => (
                <motion.tr
                  key={row._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'cursor-pointer hover:bg-brand-50/40' : ''}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`whitespace-nowrap px-4 py-3 text-gray-700 ${col.className || ''}`}>
                      {col.render ? col.render(row) : String((row as unknown as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { StatusBadge } from '../ui/StatusBadge';
