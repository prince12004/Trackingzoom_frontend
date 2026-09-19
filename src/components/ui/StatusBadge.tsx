const DEFAULT_COLORS: Record<string, string> = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-gray-100 text-gray-500',
  draft: 'bg-gray-100 text-gray-500',
  pending: 'bg-warning/10 text-warning',
  new: 'bg-brand-50 text-brand-700',
  confirmed: 'bg-brand-50 text-brand-700',
  processing: 'bg-brand-50 text-brand-700',
  packed: 'bg-brand-50 text-brand-700',
  shipped: 'bg-accent-50 text-accent-700',
  out_for_delivery: 'bg-accent-50 text-accent-700',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
  rejected: 'bg-danger/10 text-danger',
  approved: 'bg-success/10 text-success',
  success: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
  resolved: 'bg-success/10 text-success',
  closed: 'bg-gray-100 text-gray-500',
};

export function StatusBadge({ status, colorMap }: { status: string; colorMap?: Record<string, string> }) {
  const colors = colorMap || DEFAULT_COLORS;
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
