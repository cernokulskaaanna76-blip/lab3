import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { scheduleService } from "../services/schedule.service";
import {
    validateCreateSchedule,
    validatePatchSchedule,
    validateUpdateSchedule,
} from "../validators/schedule.validator";

class ScheduleController {
     async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await scheduleService.getAll(req.query);
            res.status(200).json({ items: result });
        } catch (error) {
            next(error);
        }
    };

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            if (Number.isNaN(id)) {
                throw ApiError.badRequest("Invalid id", [
                    { field: "id", message: "Id must be a number" },
                ]);
            }

            const result = await scheduleService.getById(id);

            if (!result) {
                throw ApiError.notFound("Schedule not found");
            }

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    async create (req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validateCreateSchedule(req.body);

            if (errors.length > 0) {
                throw ApiError.badRequest("Validation failed", errors);
            }

            const created = await scheduleService.create(req.body);
            res.status(201).json(created);
        } catch (error) {
            next(error);
        }
    };

    async update (req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            if (Number.isNaN(id)) {
                throw ApiError.badRequest("Invalid id", [
                    { field: "id", message: "Id must be a number" },
                ]);
            }

            const errors = validateUpdateSchedule(req.body);

            if (errors.length > 0) {
                throw ApiError.badRequest("Validation failed", errors);
            }

            const updated = await scheduleService.update(id, req.body);

            if (!updated) {
                throw ApiError.notFound("Schedule not found");
            }

            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    };

    async patch (req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            if (Number.isNaN(id)) {
                throw ApiError.badRequest("Invalid id", [
                    { field: "id", message: "Id must be a number" },
                ]);
            }

            const errors = validatePatchSchedule(req.body);

            if (errors.length > 0) {
                throw ApiError.badRequest("Validation failed", errors);
            }

            const updated = await scheduleService.patch(id, req.body);

            if (!updated) {
                throw ApiError.notFound("Schedule not found");
            }

            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    };

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            if (Number.isNaN(id)) {
                throw ApiError.badRequest("Invalid id", [
                    { field: "id", message: "Id must be a number" },
                ]);
            }

            const deleted = await scheduleService.delete(id);

            if (!deleted) {
                throw ApiError.notFound("Schedule not found");
            }

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}

export const scheduleController = new ScheduleController();