# PromptNode


A full-stack cryptocurrency wallet application built with React Native and Node.js.

## Features

- User authentication with Firebase
- HD Wallet generation for BTC, ETH, and USDT (TRC20)
- Internal transfers between users
- On-chain withdrawals
- Lightning Network payments via LNbits
- Transaction history
- Multi-language support

## Tech Stack

### Frontend (Mobile App)
- React Native + Expo
- React Navigation
- TanStack Query (React Query)
- react-i18next
- NativeWind (Tailwind CSS)
- Firebase Auth

### Backend
- Express.js
- Prisma + PostgreSQL
- Redis (optional)
- bitcoinjs-lib (BTC)
- ethers.js (ETH)
- tronweb (USDT)
- LNbits API (Lightning Network)

## Setup Instructions

### Prerequisites
- Node.js (LTS version)
- PostgreSQL
- Firebase account
- LNbits account
- QuickNode/Alchemy account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with your configuration:
   ```
   # See .env.example for required variables
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. Navigate to the app directory:
   ```bash
   cd my-crypto-wallet
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project
   - Enable Email/Password authentication
   - Add your Firebase configuration to `src/config/firebase.ts`

4. Start the Expo development server:
   ```bash
   npm start
   ```

## Development

### Database Migrations

To create a new migration after modifying the Prisma schema:

```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

### Adding New Features

1. Backend:
   - Add new routes in `backend/src/routes/`
   - Add new services in `backend/src/services/`
   - Update Prisma schema if needed

2. Mobile App:
   - Add new screens in `src/screens/`
   - Add new components in `src/components/`
   - Add new translations in `src/i18n/`

## Deployment

### Backend
- Deploy to Railway
- Set up PostgreSQL on PlanetScale or Neon
- Configure environment variables

### Mobile App
- Build with Expo
- Deploy to App Store and Play Store

## Security Considerations

- All private keys are encrypted before storage
- Firebase authentication tokens are required for all API calls
- Rate limiting is implemented on sensitive endpoints
- Input validation and sanitization
- Secure environment variable handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 
