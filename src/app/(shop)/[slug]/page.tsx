import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText } from 'lucide-react';
import { serverGet } from '@/lib/serverApi';

interface PageData {
  slug: string;
  title: string;
  content: string;
  seoTitle?: string;
  metaDescription?: string;
}

const LEGAL_SLUGS = [
  'about-us',
  'terms-and-conditions',
  'privacy-policy',
  'cancellation-policy',
  'refund-policy',
  'shipping-policy',
  'warranty-policy',
  'data-protection-policy',
];

async function getPage(slug: string) {
  if (!LEGAL_SLUGS.includes(slug)) return null;
  return serverGet<PageData>(`/pages/${slug}`, 300);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.metaDescription,
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 py-14 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="container-page relative max-w-3xl">
          <nav className="mb-4 flex items-center gap-1.5 text-xs font-medium text-brand-200">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{page.title}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <FileText className="h-5 w-5 text-accent-300" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{page.title}</h1>
          </div>
        </div>
      </section>

      <div className="container-page max-w-3xl py-10">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-10">
          <div
            className="prose prose-sm max-w-none text-gray-600 prose-headings:font-heading prose-headings:font-bold prose-headings:text-brand-900 prose-h2:mb-4 prose-h2:text-xl prose-h3:mt-6 prose-h3:text-base prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800 prose-li:marker:text-accent-500 sm:prose-base"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </div>
  );
}
