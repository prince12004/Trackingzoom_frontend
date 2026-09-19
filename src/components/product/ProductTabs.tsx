'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Product } from '@/types';
import { Accordion } from '../ui/Accordion';
import { cn } from '@/lib/utils';

export function ProductTabs({ product }: { product: Product }) {
  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'features', label: "What's in the Box" },
    ...(product.faqs.length > 0 ? [{ key: 'faqs', label: 'FAQs' }] : []),
  ];
  const [active, setActive] = useState(tabs[0].key);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              'relative shrink-0 px-4 py-3 text-sm font-medium text-gray-500',
              active === tab.key && 'text-brand-600'
            )}
          >
            {tab.label}
            {active === tab.key && (
              <motion.div layoutId="product-tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="py-6"
        >
          {active === 'description' && (
            <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription || 'No description available.' }} />
          )}
          {active === 'specifications' && (
            <>
              {product.specifications.length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="w-1/3 px-3 py-2 font-medium text-gray-600">{spec.key}</td>
                        <td className="px-3 py-2 text-gray-800">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-400">No specifications listed.</p>
              )}
              {product.features.length > 0 && (
                <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {active === 'features' && (
            <>
              {product.whatsInTheBox.length > 0 ? (
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {product.whatsInTheBox.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" /> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">Box contents not listed.</p>
              )}
              {product.warranty && <p className="mt-4 text-sm text-gray-600"><strong>Warranty:</strong> {product.warranty}</p>}
              {product.deliveryInfo && <p className="mt-2 text-sm text-gray-600"><strong>Delivery:</strong> {product.deliveryInfo}</p>}
            </>
          )}
          {active === 'faqs' && <Accordion items={product.faqs} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
