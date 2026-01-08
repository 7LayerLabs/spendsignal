// Mock Transaction Service - Generates realistic demo transactions
// This allows the app to work fully without Plaid/external services

import { generateId, randomInt, randomDecimal, randomPick, weightedRandomPick } from '@/lib/utils';
import type { Transaction, TransactionSource } from '@/types';
import type { TrafficLightZone } from '@/constants/traffic-light';

// Realistic merchant data organized by typical zone
const MOCK_MERCHANTS = {
  GREEN: [
    { name: 'Whole Foods Market', category: 'Groceries', range: [45, 180] },
    { name: 'Safeway', category: 'Groceries', range: [35, 150] },
    { name: "Trader Joe's", category: 'Groceries', range: [40, 120] },
    { name: 'Costco', category: 'Groceries', range: [80, 300] },
    { name: 'PG&E', category: 'Utilities', range: [80, 200] },
    { name: 'Comcast Internet', category: 'Internet', range: [70, 100] },
    { name: 'AT&T Wireless', category: 'Phone', range: [60, 120] },
    { name: 'State Farm Insurance', category: 'Insurance', range: [120, 200] },
    { name: 'Geico Auto', category: 'Insurance', range: [100, 180] },
    { name: 'Shell Gas Station', category: 'Transportation', range: [40, 80] },
    { name: 'Chevron', category: 'Transportation', range: [45, 85] },
    { name: 'CVS Pharmacy', category: 'Healthcare', range: [15, 80] },
    { name: 'Walgreens', category: 'Healthcare', range: [12, 60] },
    { name: 'Kaiser Permanente', category: 'Healthcare', range: [20, 50] },
    { name: 'Rent Payment', category: 'Housing', range: [1500, 2800], monthly: true },
    { name: 'Water Utility', category: 'Utilities', range: [30, 80], monthly: true },
  ],
  YELLOW: [
    { name: 'Uber Eats', category: 'Food Delivery', range: [18, 55] },
    { name: 'DoorDash', category: 'Food Delivery', range: [20, 60] },
    { name: 'Grubhub', category: 'Food Delivery', range: [22, 50] },
    { name: 'Netflix', category: 'Streaming', range: [15.99, 22.99], monthly: true },
    { name: 'Spotify', category: 'Streaming', range: [10.99, 16.99], monthly: true },
    { name: 'Hulu', category: 'Streaming', range: [7.99, 17.99], monthly: true },
    { name: 'Disney+', category: 'Streaming', range: [7.99, 13.99], monthly: true },
    { name: 'HBO Max', category: 'Streaming', range: [9.99, 15.99], monthly: true },
    { name: 'Apple Music', category: 'Streaming', range: [10.99, 16.99], monthly: true },
    { name: 'Target', category: 'Shopping', range: [25, 150] },
    { name: 'Amazon', category: 'Shopping', range: [15, 200] },
    { name: 'Starbucks', category: 'Coffee', range: [5, 15] },
    { name: "Peet's Coffee", category: 'Coffee', range: [4, 12] },
    { name: 'Blue Bottle Coffee', category: 'Coffee', range: [6, 18] },
    { name: 'Chipotle', category: 'Dining', range: [12, 25] },
    { name: 'Sweetgreen', category: 'Dining', range: [14, 22] },
    { name: 'Panera Bread', category: 'Dining', range: [10, 20] },
    { name: 'Planet Fitness', category: 'Fitness', range: [10, 25], monthly: true },
    { name: 'Equinox', category: 'Fitness', range: [180, 250], monthly: true },
    { name: 'Uber', category: 'Rideshare', range: [12, 45] },
    { name: 'Lyft', category: 'Rideshare', range: [10, 40] },
    { name: 'AMC Theatres', category: 'Entertainment', range: [15, 35] },
  ],
  RED: [
    { name: 'Louis Vuitton', category: 'Luxury', range: [500, 2500] },
    { name: 'Gucci', category: 'Luxury', range: [400, 2000] },
    { name: 'Apple Store', category: 'Electronics', range: [100, 1500] },
    { name: 'Best Buy', category: 'Electronics', range: [50, 800] },
    { name: 'Nordstrom', category: 'Fashion', range: [80, 400] },
    { name: 'Bloomingdales', category: 'Fashion', range: [100, 500] },
    { name: 'Sephora', category: 'Beauty', range: [40, 200] },
    { name: 'Ulta Beauty', category: 'Beauty', range: [30, 150] },
    { name: 'The Cheesecake Factory', category: 'Dining', range: [50, 120] },
    { name: 'Morton\'s Steakhouse', category: 'Dining', range: [100, 250] },
    { name: 'Club Nightlife', category: 'Nightlife', range: [50, 200] },
    { name: 'Bar Tab', category: 'Nightlife', range: [40, 150] },
    { name: 'Ticketmaster', category: 'Entertainment', range: [75, 400] },
    { name: 'StubHub', category: 'Entertainment', range: [100, 500] },
    { name: 'GameStop', category: 'Gaming', range: [60, 300] },
    { name: 'Steam Games', category: 'Gaming', range: [20, 80] },
    { name: 'SHEIN', category: 'Fast Fashion', range: [30, 100] },
    { name: 'Wish.com', category: 'Impulse', range: [15, 60] },
  ],
} as const;

// Zone weights for random selection (Green: 50%, Yellow: 35%, Red: 15%)
const ZONE_WEIGHTS = {
  GREEN: 50,
  YELLOW: 35,
  RED: 15,
};

// Merchant type definition
type MerchantData = {
  name: string;
  category: string;
  range: readonly [number, number];
  monthly?: boolean;
};

interface GenerateOptions {
  userId: string;
  startDate: Date;
  endDate: Date;
  transactionsPerDay?: { min: number; max: number };
  includeRecurring?: boolean;
}

// Generate demo transactions for a user
export function generateDemoTransactions(options: GenerateOptions): Omit<Transaction, 'createdAt' | 'updatedAt'>[] {
  const {
    userId,
    startDate,
    endDate,
    transactionsPerDay = { min: 1, max: 5 },
    includeRecurring = true,
  } = options;

  const transactions: Omit<Transaction, 'createdAt' | 'updatedAt'>[] = [];
  const currentDate = new Date(startDate);

  // Track recurring transactions to add monthly
  const recurringTransactions: Array<{
    merchant: MerchantData;
    zone: keyof typeof MOCK_MERCHANTS;
    dayOfMonth: number;
  }> = [];

  // Set up recurring transactions
  if (includeRecurring) {
    // Rent on the 1st
    recurringTransactions.push({
      merchant: MOCK_MERCHANTS.GREEN.find(m => m.name === 'Rent Payment')!,
      zone: 'GREEN',
      dayOfMonth: 1,
    });

    // Utilities around 15th
    recurringTransactions.push({
      merchant: MOCK_MERCHANTS.GREEN.find(m => m.name === 'PG&E')!,
      zone: 'GREEN',
      dayOfMonth: 15,
    });

    // Streaming services scattered
    const streamingServices = MOCK_MERCHANTS.YELLOW.filter(m => m.category === 'Streaming');
    streamingServices.slice(0, 3).forEach((service, i) => {
      recurringTransactions.push({
        merchant: service,
        zone: 'YELLOW',
        dayOfMonth: 5 + i * 7, // 5th, 12th, 19th
      });
    });
  }

  // Generate daily transactions
  while (currentDate <= endDate) {
    const dayOfMonth = currentDate.getDate();
    const dayOfWeek = currentDate.getDay();

    // Add recurring transactions for this day
    recurringTransactions.forEach(recurring => {
      if (recurring.dayOfMonth === dayOfMonth) {
        transactions.push(createTransaction(
          userId,
          recurring.merchant,
          new Date(currentDate),
          true
        ));
      }
    });

    // Generate random daily transactions
    // More transactions on weekends
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const txCount = randomInt(
      transactionsPerDay.min,
      isWeekend ? transactionsPerDay.max + 2 : transactionsPerDay.max
    );

    for (let i = 0; i < txCount; i++) {
      const zone = getWeightedRandomZone();
      const allMerchants = MOCK_MERCHANTS[zone] as readonly MerchantData[];
      const merchants = allMerchants.filter(m => !m.monthly);

      if (merchants.length > 0) {
        const merchant = randomPick([...merchants]);

        // Add some time variation within the day
        const txDate = new Date(currentDate);
        txDate.setHours(randomInt(7, 22));
        txDate.setMinutes(randomInt(0, 59));

        transactions.push(createTransaction(userId, merchant, txDate, false));
      }
    }

    // Add occasional impulse purchases (late night, weekends)
    if ((isWeekend || currentDate.getHours() > 21) && Math.random() < 0.15) {
      const redMerchants = MOCK_MERCHANTS.RED as readonly MerchantData[];
      const impulseMerchant = randomPick([...redMerchants]);
      const impulseDate = new Date(currentDate);
      impulseDate.setHours(randomInt(21, 23));
      transactions.push(createTransaction(userId, impulseMerchant, impulseDate, false));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort by date descending (newest first)
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Create a single transaction
function createTransaction(
  userId: string,
  merchant: MerchantData,
  date: Date,
  isRecurring: boolean
): Omit<Transaction, 'createdAt' | 'updatedAt'> {
  const amount = merchant.range
    ? randomDecimal(merchant.range[0], merchant.range[1])
    : randomDecimal(10, 100);

  return {
    id: generateId(),
    userId,
    amount,
    description: `${merchant.name} - ${merchant.category}`,
    merchantName: merchant.name,
    date,
    source: 'DEMO' as TransactionSource,
    externalId: `demo-${generateId()}`,
    defaultCategory: merchant.category,
    pending: false,
    isRecurring,
  };
}

// Get weighted random zone
function getWeightedRandomZone(): keyof typeof MOCK_MERCHANTS {
  const zones = Object.keys(ZONE_WEIGHTS) as Array<keyof typeof ZONE_WEIGHTS>;
  const weights = zones.map(z => ZONE_WEIGHTS[z]);
  return weightedRandomPick(zones, weights);
}

// Generate AI suggestion for a transaction
export function generateAISuggestion(transaction: Omit<Transaction, 'createdAt' | 'updatedAt'>): {
  zone: TrafficLightZone;
  confidence: number;
  reasoning: string;
} {
  const merchantName = transaction.merchantName || '';
  const category = transaction.defaultCategory || '';
  const amount = Number(transaction.amount);

  // Find which zone this merchant typically belongs to
  let suggestedZone: TrafficLightZone = 'YELLOW';
  let confidence = 0.7;
  let reasoning = 'Evaluate if this adds real value to your life.';

  // Check GREEN merchants
  const greenMatch = MOCK_MERCHANTS.GREEN.find(
    m => merchantName.toLowerCase().includes(m.name.toLowerCase().split(' ')[0])
  );
  if (greenMatch) {
    suggestedZone = 'GREEN';
    confidence = 0.95;
    reasoning = getGreenReasoning(category);
  }

  // Check RED merchants
  const redMatch = MOCK_MERCHANTS.RED.find(
    m => merchantName.toLowerCase().includes(m.name.toLowerCase().split(' ')[0])
  );
  if (redMatch) {
    suggestedZone = 'RED';
    confidence = 0.85;
    reasoning = getRedReasoning(category, amount);
  }

  // Check YELLOW merchants
  const yellowMatch = MOCK_MERCHANTS.YELLOW.find(
    m => merchantName.toLowerCase().includes(m.name.toLowerCase().split(' ')[0])
  );
  if (yellowMatch) {
    suggestedZone = 'YELLOW';
    confidence = 0.8;
    reasoning = getYellowReasoning(category, merchantName);
  }

  return { zone: suggestedZone, confidence, reasoning };
}

function getGreenReasoning(category: string): string {
  const reasons: Record<string, string> = {
    Groceries: 'Food is essential. Eating at home saves money.',
    Utilities: 'Keeping the lights on. Non-negotiable.',
    Housing: 'Roof over your head. No question.',
    Insurance: 'Protecting what matters. Smart move.',
    Healthcare: 'Your health is worth it.',
    Transportation: 'Getting to work. Essential.',
    Phone: 'Staying connected in 2025. Necessary.',
    Internet: 'Required for modern life. Accept it.',
  };
  return reasons[category] || 'Essential expense. Keep it.';
}

function getYellowReasoning(category: string, merchant: string): string {
  const reasons: Record<string, string[]> = {
    'Food Delivery': [
      'Convenient, but is cooking really that hard?',
      'Delivery fees add up. Track how often.',
      'Your kitchen is right there.',
    ],
    Streaming: [
      'How many streaming services do you actually watch?',
      'Are you getting value from this subscription?',
      'When did you last use this?',
    ],
    Coffee: [
      'That\'s a lot of lattes. Home brew is $0.50.',
      'Coffee habit adding up? Do the math.',
      'Is this fuel or procrastination?',
    ],
    Dining: [
      'Eating out is fun. But how often?',
      'Social meal or solo splurge?',
      'Could you make this at home?',
    ],
    Shopping: [
      'Need or want? Be honest.',
      'Will you use this in 30 days?',
      'Impulse or planned purchase?',
    ],
    Fitness: [
      'Are you actually going to the gym?',
      'Great investment IF you use it.',
      'When was your last workout there?',
    ],
    Rideshare: [
      'Public transit an option here?',
      'Surge pricing active?',
      'Could you have walked?',
    ],
    Entertainment: [
      'Budget for fun is healthy. Is this in budget?',
      'Memorable experience or forgettable?',
      'Worth skipping something else for?',
    ],
  };
  const categoryReasons = reasons[category] || ['Evaluate if this adds value.'];
  return randomPick(categoryReasons);
}

function getRedReasoning(category: string, amount: number): string {
  const reasons: Record<string, string[]> = {
    Luxury: [
      `$${amount.toFixed(0)} could be invested instead.`,
      'Luxury or necessity? You know the answer.',
      'What would Clark Howard say?',
    ],
    Electronics: [
      'Do you need this or want this?',
      'Your current device still works, right?',
      'New and shiny isn\'t always better.',
    ],
    Fashion: [
      'Fast fashion = fast regret.',
      'Will you wear this 30 times?',
      'Closet full, nothing to wear?',
    ],
    Beauty: [
      'Skincare routine getting expensive?',
      'Do you use what you already have?',
      'Marketing got you, didn\'t it?',
    ],
    Nightlife: [
      'Fun night, expensive morning.',
      'Social pressure or genuine fun?',
      'Your bank account felt that.',
    ],
    Gaming: [
      'Another game to add to the backlog?',
      'Will you finish this one?',
      'Entertainment budget: check it.',
    ],
    Impulse: [
      'Late night shopping? Classic trap.',
      'Would you buy this tomorrow morning?',
      'FOMO is expensive.',
    ],
  };
  const categoryReasons = reasons[category] || [`$${amount.toFixed(0)} you could save or invest.`];
  return randomPick(categoryReasons);
}

// Get suggested zone for a new transaction based on merchant history
export function getSuggestedZone(
  merchantName: string,
  userHistory: Array<{ merchantName: string; zone: TrafficLightZone }>
): TrafficLightZone | null {
  const previousCategorizations = userHistory.filter(
    h => h.merchantName?.toLowerCase() === merchantName.toLowerCase()
  );

  if (previousCategorizations.length >= 2) {
    // User has categorized this merchant before - use their preference
    const zoneCounts = previousCategorizations.reduce((acc, h) => {
      acc[h.zone] = (acc[h.zone] || 0) + 1;
      return acc;
    }, {} as Record<TrafficLightZone, number>);

    const mostCommon = Object.entries(zoneCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return mostCommon[0] as TrafficLightZone;
  }

  return null;
}
