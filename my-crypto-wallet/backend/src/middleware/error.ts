import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    statusCode: number;
    status: string;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err.message,
        });
    }

    // Log the error for debugging
    console.error('Error:', err);

    // Default error response
    return res.status(500).json({
        status: 'error',
        error: 'Something went wrong',
    });
}; 