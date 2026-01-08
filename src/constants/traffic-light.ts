// Traffic Light Zone definitions based on Clark Howard's system
// Published September 2025 on clark.com

export const TRAFFIC_LIGHT_ZONES = {
  UNCATEGORIZED: 'UNCATEGORIZED',
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
} as const;

export type TrafficLightZone = keyof typeof TRAFFIC_LIGHT_ZONES;

export const ZONE_CONFIG = {
  UNCATEGORIZED: {
    label: 'Inbox',
    description: 'New transactions to categorize',
    color: '#64748B', // Slate-500
    bgColor: '#1E293B', // Slate-800
    borderColor: '#475569', // Slate-600
    examples: ['Waiting for your assessment'],
  },
  GREEN: {
    label: 'Green Light',
    description: 'Must-pay essentials',
    subtext: 'Rent, utilities, groceries, insurance, transportation',
    color: '#22C55E', // Green-500
    bgColor: '#14532D', // Green-900
    borderColor: '#16A34A', // Green-600
    examples: [
      'Rent/Mortgage',
      'Electric bill',
      'Water bill',
      'Groceries',
      'Car insurance',
      'Health insurance',
      'Gas for commute',
      'Prescription medication',
    ],
  },
  YELLOW: {
    label: 'Yellow Light',
    description: 'Think twice',
    subtext: 'Discretionary - pause and evaluate',
    color: '#EAB308', // Yellow-500
    bgColor: '#713F12', // Yellow-900
    borderColor: '#CA8A04', // Yellow-600
    examples: [
      'Streaming subscriptions',
      'Dining out',
      'Coffee shops',
      'Gym membership',
      'New clothes',
      'Uber/Lyft',
      'Food delivery',
      'Entertainment',
    ],
  },
  RED: {
    label: 'Red Light',
    description: 'Avoid',
    subtext: 'Wants masquerading as needs',
    color: '#EF4444', // Red-500
    bgColor: '#7F1D1D', // Red-900
    borderColor: '#DC2626', // Red-600
    examples: [
      'Impulse purchases',
      'Luxury items',
      'Expensive electronics',
      'Designer clothing',
      'Bar tabs',
      'Casino/gambling',
      'Premium upgrades',
      'FOMO purchases',
    ],
  },
} as const;

// AI suggestion prompts for each zone
export const ZONE_TOUGH_LOVE = {
  GREEN: [
    'Essential. No judgment needed.',
    'Roof over head. Non-negotiable.',
    'Keeping the lights on. Good.',
    "Can't skip this one.",
  ],
  YELLOW: [
    'Questionable. But you\'re the boss.',
    'Is this adding real value?',
    'Worth the cost? You decide.',
    'Could you live without it?',
  ],
  RED: [
    "That's money you could have invested. Just saying.",
    'Want or need? Be honest.',
    'Future you might regret this.',
    'Impulse or intention?',
  ],
} as const;

// Tough-love messages for patterns
export const PATTERN_MESSAGES = {
  REPEAT_MERCHANT: (merchant: string, count: number, total: number) =>
    `${count} visits to ${merchant} this week. That's $${total.toFixed(2)}. Essential?`,
  SUBSCRIPTION_STACK: (count: number) =>
    `${count} streaming services? Pick your favorites. Cancel the rest.`,
  COFFEE_HABIT: (count: number, total: number) =>
    `${count} coffee runs this week = $${total.toFixed(2)}. Make it at home?`,
  DINING_OUT: (total: number) =>
    `$${total.toFixed(2)} on dining this month. Grocery budget looking jealous.`,
  IMPULSE_TIME: () =>
    'Late-night purchase? Sleep on it. Still want it tomorrow?',
};
