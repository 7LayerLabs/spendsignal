import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

if (!PLAID_CLIENT_ID) {
  console.warn('PLAID_CLIENT_ID is not set - Plaid features will be disabled');
}

if (!PLAID_SECRET) {
  console.warn('PLAID_SECRET is not set - Plaid features will be disabled');
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID || '',
      'PLAID-SECRET': PLAID_SECRET || '',
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Products we request from Plaid
export const PLAID_PRODUCTS: Products[] = [Products.Transactions];

// Countries we support
export const PLAID_COUNTRY_CODES: CountryCode[] = [CountryCode.Us];

// Check if Plaid is configured
export function isPlaidConfigured(): boolean {
  return Boolean(PLAID_CLIENT_ID && PLAID_SECRET);
}
