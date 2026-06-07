export const serviceConfig = {
  users: {
    url: process.env.USERS_SERVICE_URL || 'http://localhost:3000',
    timeout: 10000, // 10.0000 ms - 10 seconds
  },
  products: {
    url: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001',
    timeout: 10000,
  },
  checkouts: {
    url: process.env.CHECKOUTS_SERVICE_URL || 'http://localhost:3003',
    timeout: 10000,
  },
  payments: {
    url: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004',
    timeout: 10000,
  },
} as const;
