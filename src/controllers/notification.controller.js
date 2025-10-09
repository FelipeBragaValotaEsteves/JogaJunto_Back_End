import { NotificationService } from '../services/notification.service.js';

export const NotificationController = {
    async get(req, res, next) {
        try {
            const { device_token } = req.params;
            const result = await NotificationService.get(device_token);
            res.status(201).json(result);
        } catch (err) { next(err); }
    },
};
