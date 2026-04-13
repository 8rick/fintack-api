import { Router } from "express";
import { UserService } from "./user.services";

const router = Router();
const service = new UserService();

router.post('/register', async (req, res) => {
    try {
        const result = await service.register(req.body);

        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
      const result = await service.login(req.body);

      return res.status(200).json(result);
    } catch (error: any) {
        return res.status(401).json({ error: error.message });
    }
});

export default router;