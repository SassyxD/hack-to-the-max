import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Crypto Wallet API is running!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 