import { Router } from "express";
import { TransactionService } from "./transaction.services";

const router = Router();
const service = new TransactionService();

router.post('/', async(req, res) => {
    try{
        const userId = '329abc88-1024-4d3e-b5be-cd64c793f9cc';
        const transaction = await service.create({...req.body, userId});

        return res.status(201).json(transaction);
    } catch (error: any) {
        return res.status(400).json({ error: error.message});
    }
}); 

router.get('/', async (req, res) => {
  try {
    const userId = '329abc88-1024-4d3e-b5be-cd64c793f9cc';
    const transactions = await service.listByUser(userId);

    return res.status(200).json(transactions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
    try {
        const userId = '329abc88-1024-4d3e-b5be-cd64c793f9cc';

        const transaction = await service.getById(req.params.id, userId);
        return res.status(201).json(transaction);
    } catch (error: any) {
        return res.status(404).json({ error: error.message});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const userId = '329abc88-1024-4d3e-b5be-cd64c793f9cc';

        const transaction = await service.update(req.params.id, userId, req.body);
        return res.status(200).json(transaction);
    } catch (error: any) {
        return res.status(400).json({ error: error.message});
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const userId = '329abc88-1024-4d3e-b5be-cd64c793f9cc';

        await service.delete(req.params.id, userId);
        return res.status(204).send();
    } catch (error: any) {
        return res.status(400).json({ error: error.message});
    }
});

export default router;