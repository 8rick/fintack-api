// src/modules/transactions/transaction.routes.ts

import { Router } from 'express';
import { TransactionService } from './transaction.services';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();
const service = new TransactionService();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const transaction = await service.create({ ...req.body, userId });
    return res.status(201).json(transaction);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const transactions = await service.listByUser(userId);
    return res.status(200).json(transactions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const transaction = await service.getById(req.params.id, userId);
    return res.status(200).json(transaction);
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const transaction = await service.update(req.params.id, userId, req.body);
    return res.status(200).json(transaction);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.userId;
    await service.delete(req.params.id, userId);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;