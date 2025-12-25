/**
 * API 错误定义
 */
export class ApiError extends Error {
    constructor(message, code, response) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.response = response;
        this.timestamp = Date.now();
    }
}

export const ErrorCodes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNKNOWN: 'UNKNOWN',
};

export function createApiError(message, code, response) {
    return new ApiError(message, code, response);
}
