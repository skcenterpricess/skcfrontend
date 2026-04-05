import type { Achievement, HeaderSidebar, Product, Testimonial } from '@/shared/types/content'

const now = new Date('2026-04-05T00:00:00.000Z').toISOString()

export const mockHeaderSlides: HeaderSidebar[] = [
  {
    _id: 'mock-slide-1',
    image:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80',
    heading: 'Story-first product pages that convert attention to trust',
    description:
      'Use editorial structure, focused visuals, and concise copy to turn first impressions into meaningful action.',
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'mock-slide-2',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
    heading: 'Launch-ready marketing sections for high-velocity teams',
    description:
      'Ship campaigns faster with reusable blocks built for products, social proof, and milestone storytelling.',
    createdAt: now,
    updatedAt: now,
  },
]

export const mockProducts: Product[] = [
  {
    _id: 'mock-product-1',
    name: 'Premium Portfolio Kit',
    base_price: 4999,
    marked_price: 6999,
    coopan_price: 5499,
    description:
      'A curated design pack with high-converting hero layouts, pricing cards, and testimonial sections.',
    size: 'Starter',
    version: 'v2',
    stok: 45,
    avgRating: 4.8,
    ratingCount: 138,
    isActive: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1200&q=80',
        public_id: 'mock-product-1-cover',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
        public_id: 'mock-product-1-alt',
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'mock-product-2',
    name: 'Brand Story Framework',
    base_price: 7999,
    marked_price: 9999,
    coopan_price: 8499,
    description:
      'Reusable content structure to present brand strategy, outcomes, and proof in a single narrative flow.',
    size: 'Growth',
    version: 'v1',
    stok: 26,
    avgRating: 4.7,
    ratingCount: 94,
    isActive: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80',
        public_id: 'mock-product-2-cover',
        isPrimary: true,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'mock-product-3',
    name: 'Campaign Sprint Assets',
    base_price: 3499,
    marked_price: 4999,
    coopan_price: 3899,
    description:
      'Rapid-turnaround visual assets for launches, product updates, and seasonal campaign pages.',
    size: 'Lite',
    version: 'v3',
    stok: 61,
    avgRating: 4.6,
    ratingCount: 72,
    isActive: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
        public_id: 'mock-product-3-cover',
        isPrimary: true,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
]

export const mockTestimonials: Testimonial[] = [
  {
    _id: 'mock-testimonial-1',
    name: 'Anika Sharma',
    designation: 'Marketing Director, Bloomline',
    message:
      'We replaced a generic landing page with this framework and saw better lead quality within the first two weeks.',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'mock-testimonial-2',
    name: 'Rahul Menon',
    designation: 'Founder, Arc Studio',
    message:
      'The structure helped us clarify our offer and made our product demo page feel premium without over-designing.',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'mock-testimonial-3',
    name: 'Sara Iqbal',
    designation: 'Product Lead, Northpeak',
    message:
      'Setup was quick, and the content hierarchy made it much easier for visitors to understand what we do.',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
]

export const mockAchievements: Achievement[] = [
  {
    _id: 'mock-achievement-1',
    title: '120+ client launches supported',
    description: 'Delivered portfolio and product storytelling pages across SaaS, retail, and service brands.',
    value: '120+',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'mock-achievement-2',
    title: '34% faster campaign deployment',
    description:
      'Reusable sections and clear content system reduce handoff delays between marketing and design teams.',
    value: '34% faster',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: 'mock-achievement-3',
    title: '4.8 average project satisfaction',
    description: 'Clients highlight clarity, speed, and visual coherence as key outcomes after implementation.',
    value: '4.8/5',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
]
