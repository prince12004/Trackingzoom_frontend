'use client';

import { useQuery } from '@tanstack/react-query';
import { api, ApiEnvelope } from '@/lib/api';
import { HomepageSection } from '@/types';
import { Hero } from '@/components/home/Hero';
import { ServicesSection } from '@/components/home/ServicesSection';
import { TabbedProductShowcase } from '@/components/home/TabbedProductShowcase';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductRail } from '@/components/home/ProductRail';
import { OffersStrip } from '@/components/home/OffersStrip';
import { StatsCounter } from '@/components/home/StatsCounter';
import { HowItWorks } from '@/components/home/HowItWorks';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { TrustBadges } from '@/components/home/TrustBadges';
import { CompatibilitySection } from '@/components/home/CompatibilitySection';
import { AppPromotion } from '@/components/home/AppPromotion';
import { ExpertReviewsSection } from '@/components/home/ExpertReviewsSection';
import { CustomerReviewsSection } from '@/components/home/CustomerReviewsSection';
import { BlogSection } from '@/components/home/BlogSection';
import { CallbackSection } from '@/components/home/CallbackSection';

const SECTION_COMPONENTS: Record<string, React.ReactNode> = {
  hero: <Hero key="hero" />,
  services: <ServicesSection key="services" />,
  product_showcase: <TabbedProductShowcase key="product_showcase" />,
  categories: <CategoryGrid key="categories" />,
  featured_products: (
    <ProductRail key="featured_products" title="Featured Products" params={{ featured: 'true' }} viewAllHref="/products?featured=true" />
  ),
  gps_products: (
    <ProductRail
      key="gps_products"
      title="GPS Trackers"
      subtitle="Real-time tracking for every vehicle type"
      params={{ search: 'GPS Tracker' }}
      viewAllHref="/products?search=GPS+Tracker"
    />
  ),
  accessories: (
    <ProductRail
      key="accessories"
      title="Vehicle Accessories"
      params={{ category: 'vehicle-accessories' }}
      viewAllHref="/products?category=vehicle-accessories"
    />
  ),
  best_sellers: (
    <ProductRail key="best_sellers" title="Best Sellers" params={{ bestSeller: 'true', sort: 'best_selling' }} viewAllHref="/products?bestSeller=true" />
  ),
  new_arrivals: (
    <ProductRail key="new_arrivals" title="New Arrivals" params={{ newArrival: 'true', sort: 'newest' }} viewAllHref="/products?newArrival=true" />
  ),
  offers: <OffersStrip key="offers" />,
  stats: <StatsCounter key="stats" />,
  how_it_works: <HowItWorks key="how_it_works" />,
  why_choose_us: <WhyChooseUs key="why_choose_us" />,
  trust_badges: <TrustBadges key="trust_badges" />,
  compatibility: <CompatibilitySection key="compatibility" />,
  app_promotion: <AppPromotion key="app_promotion" />,
  expert_reviews: <ExpertReviewsSection key="expert_reviews" />,
  customer_reviews: <CustomerReviewsSection key="customer_reviews" />,
  blogs: <BlogSection key="blogs" />,
  callback: <CallbackSection key="callback" />,
};

export default function HomePage() {
  const { data: sections, isLoading } = useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => (await api.get<ApiEnvelope<HomepageSection[]>>('/homepage-sections')).data.data,
  });

  const ordered = (sections || []).slice().sort((a, b) => a.displayOrder - b.displayOrder);
  const hasHero = ordered.some((s) => s.key === 'hero');

  return (
    <div>
      {isLoading && (
        <div aria-hidden className="min-h-[520px] bg-gradient-to-br from-brand-950 mains_brand lg:min-h-[600px]" />
      )}
      {!isLoading && !hasHero && <Hero />}
      {ordered.map((section) => SECTION_COMPONENTS[section.key] || null)}
    </div>
  );
}
