import express from 'express';
import dotenv from 'dotenv';

import transactionRoutes from './modules/transactions/transaction.route';
import userRoutes from './modules/users/user.routes';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/health', (req,res) => {
    res.status(201).json({
        status: 'ok',
        message: 'Fintack Ai no ar 🚀',
    });
});

app.use('/auth', userRoutes)

app.use('/transactions', transactionRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
    console.log(`🔍 teste http://localhost:${PORT}/health`);
})