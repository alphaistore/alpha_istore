// frontend/config.js
// Single source of truth for site identity and design tokens.

const siteConfig = {
  name: 'AlphaiStore',
  description:
    "Ghana's trusted destination for new, UK-used, and Ghana-used smartphones.",
  apiEndpoint:
    process.env.NEXT_PUBLIC_API_ENDPOINT || process.env.NEXT_PUBLIC_API_URL || '/api',
  frontendUrl:
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://www.alphaistoregh.com',
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233575453086',
  themeColor: '#2563EB',

  currency: {
    code: 'GHS',
    symbol: 'GH₵',
    locale: 'en-GH',
  },

  contact: {
    email: 'info@alphaistoregh.com',
    phone: '+233 57 545 3086',
    address: 'Adum, near Alife Supermarket, opposite Jolly Shop, Kumasi, Ghana',
  },

  deliveryRegions: [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Eastern',
    'Central',
    'Northern',
    'Volta',
    'Upper East',
    'Upper West',
    'Bono',
  ],

  social: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
  },

  colors: {
    primary: {
      DEFAULT: '#2563EB',
      dark: '#1D4ED8',
      50: '#EFF6FF',
      100: '#DBEAFE',
    },
    text: '#0F172A',
    'text-muted': '#475569',
    border: '#E2E8F0',
    surface: '#FFFFFF',
    'surface-muted': '#F8FAFC',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
  },
};

export default siteConfig;