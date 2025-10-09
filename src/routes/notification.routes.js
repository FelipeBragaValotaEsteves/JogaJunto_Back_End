import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';

const router = Router();

router.get('/:device_token', NotificationController.get);

export default router;
