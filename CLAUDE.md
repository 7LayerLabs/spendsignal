# SpendSignal - Development Guidelines

**Slogan:** "Green means grow."

**Secondary tagline:** "From red to ready." (used on signup page)

---

## Priority Rules

### 1. Frontend Aesthetics
**Avoid "AI Slop" - Create distinctive, memorable design.**

#### Typography
- NO generic fonts (Inter, Roboto, Arial, system fonts, Space Grotesk)
- YES distinctive, beautiful fonts that elevate the experience
- Choose fonts that feel intentional and designed for THIS app

#### Color & Theme
- Traffic light colors (Green/Yellow/Red) are sacred for zones
- Dominant colors with sharp accents > timid, evenly-distributed palettes
- NO clichéd purple gradients on white backgrounds
- Use CSS variables for consistency
- Draw from premium fintech aesthetics - serious, trustworthy, bold

#### Motion & Animation
- High-impact moments (page load, staggered reveals)
- CSS-first, Framer Motion for complex interactions
- One well-orchestrated animation > scattered micro-interactions
- Focus on drag-drop feedback for the canvas

#### Backgrounds & Atmosphere
- Create depth - NO flat solid color backgrounds
- Layer gradients, geometric patterns, contextual effects
- The "tough love coach" vibe should feel premium and serious, not sterile

#### The Test
Would a designer look at this and think "AI made this"? If yes, redo it.

---

### 2. Context First
**Before making ANY changes, deeply understand the codebase.**

When starting a session or picking up work:
1. Read the project structure and key files
2. Understand data flow (Supabase → API routes → Components)
3. Understand the subscription tier system (Free vs Premium)
4. Understand demo mode vs real Plaid mode
5. Ask questions if anything is unclear

**Never assume. Never guess. Understand first, then act.**

This app handles financial data - mistakes erode user trust.

---

### 3. Tool Use Summaries
**After completing any task involving tools, provide a clear summary.**

Include:
- What files were created/modified
- What was accomplished
- Any issues encountered
- What's next

Example:
```
✅ Created 3 files:
- src/components/TransactionCard.tsx (draggable card component)
- src/components/TrafficLightZone.tsx (drop zone)
- src/hooks/useCategorization.ts (state management)

⚠️ Note: Added placeholder for AI suggestion badge

Next: Building the transaction board container
```

---

### 4. Bias Toward Action
**Implement changes, don't just suggest them.**

- Intent clear → Do it
- Intent unclear → Infer the most useful action and proceed
- Use tools to discover missing details rather than guessing
- When in doubt, act and explain what you did

**Exception:** Major architectural decisions or destructive actions (deleting files, changing database schema) - confirm first.

---

### 5. Parallel Tool Calls
**Run independent operations simultaneously to maximize speed.**

**DO parallelize:**
- Reading multiple files at once
- Creating independent components
- Running unrelated searches

**DON'T parallelize:**
- When one call depends on another's result
- When parameters come from a previous call
- Never guess or use placeholders for missing values

---

### 6. No Speculation
**Never claim anything about code you haven't read.**

- If user references a file → Read it first, then answer
- If unsure about implementation → Investigate before responding
- If you don't know → Say "Let me check" and actually check

---

## SpendSignal Specific Rules

### Traffic Light Colors Are Sacred
```css
--green-500: #22C55E;  /* Essentials - must pay */
--yellow-500: #EAB308; /* Discretionary - think twice */
--red-500: #EF4444;    /* Avoid - wants as needs */
```
Never deviate from these for zone identification.

### Tough-Love Tone Everywhere
All user-facing copy matches the "judgmental coach" voice.

**Bad:** "Oopsie! Something went wrong 🥺"
**Good:** "Something broke. Try again."

**Bad:** "Great job! You're doing amazing! 🎉"
**Good:** "Discipline looks good on you."

Examples:
- Red zone drop: "That's $47 you could have invested. Just saying."
- Pattern detection: "Third coffee shop this week. Essential or escapism?"
- Over budget: "Budget broken. The numbers don't lie."

### Demo Mode Always Works
App must be fully functional without external services.
- Mock transactions with realistic merchants
- Placeholder auth that works locally
- All features testable in demo mode

### Clark Howard Attribution
Footer and about page must include:
"Inspired by Clark Howard's Traffic Light System"

### No Fabricated Information
**This app is about truth and personal finance. There is no room for made-up information.**

- NEVER fabricate, invent, or twist quotes from real people (Clark Howard or anyone else)
- NEVER make up statistics, studies, or financial data
- NEVER present AI-generated text as if it were a real quote
- If information cannot be verified, don't include it
- If unsure about a fact, research it first or omit it

**Exception - Demo Mode:** Mock transaction data for demo mode is acceptable since users understand it's simulated. Mark any demo/sample data clearly with visual indicators so users know it's not real.

When displaying demo data:
- Use obvious placeholder merchants ("Demo Coffee Shop", not "Starbucks")
- Or mark with an asterisk/badge indicating sample data
- Never mix real quotes/data with fabricated content

### Respect Subscription Tiers
Always check user tier before premium features.
- Free users see upgrade prompts, not errors
- Premium features: Plaid, unlimited goals, alerts, reports, trends

---

## Code Quality Rules

### TypeScript Strict Mode
- No `any` types
- Full type safety
- Catch bugs before runtime

### Functional Components Only
- Modern React style
- No class components
- Use hooks for state and effects

### Named Exports
```typescript
// Good
export { Button }
export { TransactionCard }

// Bad
export default Button
```

### Small, Focused Files
- Components under 200 lines
- One responsibility per file
- Extract when complexity grows

### Business Logic in Services
- Components render UI
- Services handle logic
- `/lib/services/` for calculations, validations, transformations

### Custom Hooks for Reusable Logic
- Shared behavior → extract to `/hooks/`
- Examples: `useTransactions()`, `useCategorization()`, `useDemoMode()`

---

## Security Rules

### No Secrets Client-Side
- Only `NEXT_PUBLIC_*` vars in browser code
- API keys stay on server
- Never expose Stripe secret, Plaid tokens, etc.

### Validate All Input
- Every API route validates with Zod
- Never trust user input
- Sanitize before database operations

### Sanitize Before Display
- Prevent XSS attacks
- React escapes by default, but be vigilant with `dangerouslySetInnerHTML`

### No Secrets in Commits
- Use `.env.local` for secrets
- Never commit real API keys
- `.env.example` with placeholders only

---

## UI/UX Rules

### Mobile-First Responsive
- Design for phones first
- Enhance for tablet and desktop
- Canvas uses swipe gestures on mobile

### Loading States Required
- Every async action shows loading indicator
- No blank screens while waiting
- Skeleton loaders for content areas

### Accessible (WCAG 2.1 AA)
- Proper ARIA labels
- Keyboard navigation for drag-drop
- Sufficient color contrast
- Screen reader support

### Error States with Helpful Messages
- Not just "Error" - tell user what happened
- Provide actionable next steps
- Maintain tough-love tone even in errors

---

## Performance Rules

### Lazy Load Routes
- Next.js App Router handles this automatically
- Use dynamic imports for heavy components

### Virtualize Long Lists
- Don't render 500 transactions at once
- Use virtualization for lists over 50 items
- Consider `@tanstack/react-virtual`

### Optimize Images
- Use Next.js Image component
- Lazy load below-the-fold images
- Proper sizing and formats

---

## Git Rules

### Conventional Commits
```
feat: add transaction drag-drop
fix: correct zone color on hover
docs: update README with setup
refactor: extract categorization hook
style: improve canvas spacing
test: add goal progress tests
```

---

## Project Structure Reference

```
spendsignal/
├── CLAUDE.md              # This file
├── SETUP_GUIDE.md         # External service setup instructions
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities, services, configs
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand stores
│   ├── types/             # TypeScript types
│   └── constants/         # App constants
└── .env.example           # Environment variable template
```

---

## Key Files to Understand

| File | Purpose |
|------|---------|
| `src/components/transactions/transaction-board.tsx` | Core canvas with drag-drop |
| `src/components/transactions/traffic-light-zone.tsx` | Drop zone components |
| `src/lib/services/mock-transaction-service.ts` | Demo data generator |
| `src/hooks/use-categorization.ts` | Categorization state management |
| `src/constants/traffic-light.ts` | Zone definitions and colors |
