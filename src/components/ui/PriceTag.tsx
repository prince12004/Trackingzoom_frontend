import { formatCurrency, discountPercent } from '@/lib/utils';

export function PriceTag({
  regularPrice,
  salePrice,
  size = 'md',
}: {
  regularPrice: number;
  salePrice?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const effective = salePrice && salePrice < regularPrice ? salePrice : regularPrice;
  const percent = discountPercent(regularPrice, salePrice);
  const priceCls = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-base';
  const mrpCls = size === 'lg' ? 'text-lg' : size === 'md' ? 'text-sm' : 'text-xs';
  const offCls = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`font-extrabold text-brand-800 ${priceCls}`}>{formatCurrency(effective)}</span>
      {percent > 0 && (
        <>
          <span className={`text-gray-400 line-through ${mrpCls}`}>{formatCurrency(regularPrice)}</span>
          <span className={`font-bold text-success ${offCls}`}>{percent}% off</span>
        </>
      )}
    </div>
  );
}
