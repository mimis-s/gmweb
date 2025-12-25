/**
 * API 错误模块测试
 */
import { describe, it, expect } from 'vitest';
import { ApiError, ErrorCodes, createApiError } from '../js/api/errors.js';

describe('API Errors', () => {
    describe('ApiError 类', () => {
        it('应该正确创建错误实例', () => {
            const error = new ApiError('Test error', 'TEST_CODE', { details: 'test' });
            
            expect(error.message).toBe('Test error');
            expect(error.code).toBe('TEST_CODE');
            expect(error.response).toEqual({ details: 'test' });
            expect(error.name).toBe('ApiError');
            expect(error.timestamp).toBeDefined();
        });
        
        it('应该能够被作为 Error 实例使用', () => {
            const error = new ApiError('Test error', 'TEST_CODE', null);
            
            expect(error instanceof Error).toBe(true);
            expect(error instanceof ApiError).toBe(true);
        });
    });
    
    describe('ErrorCodes', () => {
        it('应该包含所有错误码', () => {
            expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
            expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
            expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
            expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND');
            expect(ErrorCodes.SERVER_ERROR).toBe('SERVER_ERROR');
            expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
            expect(ErrorCodes.UNKNOWN).toBe('UNKNOWN');
        });
    });
    
    describe('createApiError 工厂函数', () => {
        it('应该正确创建错误', () => {
            const error = createApiError('Network error', ErrorCodes.NETWORK_ERROR, null);
            
            expect(error.message).toBe('Network error');
            expect(error.code).toBe('NETWORK_ERROR');
            expect(error.response).toBeNull();
        });
    });
});
