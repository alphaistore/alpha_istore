const siteConfig = {
  name: 'Alpha iStore',
  description: "Ghana's #1 Premium Phone Store",
  colors: {
    primary: {
      DEFAULT: '#000000',
      dark: '#1a1a1a',
      light: '#f5f5f5',
    },
  },
  contact: {
    address: 'Adum, near Alife Supermarket, opposite Jolly Shop, Kumasi, Ghana',
    phone: '+233 575 453 086',
    email: 'info@alphaistoregh.com',
    whatsappNumber: '233575453086',
  },
  apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || process.env.NEXT_PUBLIC_API_URL || '/api',
};

export default siteConfig;
