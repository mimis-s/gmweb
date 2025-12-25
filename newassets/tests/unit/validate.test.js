/**
 * 验证工具测试
 */
import { describe, it, expect } from 'vitest';
import { 
    required, 
    minLength, 
    maxLength, 
    email, 
    phone, 
    range,
    positiveInteger,
    pattern,
    FormValidator,
    createFormValidator 
} from '../js/utils/validate.js';

describe('Utils - 验证器', () => {
    describe('required', () => {
        it('应该验证非空值', () => {
            const validator = required('不能为空');
            
            expect(() => validator('test')).not.toThrow();
            expect(() => validator(123)).not.toThrow();
            expect(() => validator([])).not.toThrow();
        });
        
        it('应该拒绝空值', () => {
            const validator = required('不能为空');
            
            expect(() => validator('')).toThrow('不能为空');
            expect(() => validator(null)).toThrow('不能为空');
            expect(() => validator(undefined)).toThrow('不能为空');
            expect(() => validator([])).toThrow('不能为空');
        });
    });
    
    describe('minLength', () => {
        it('应该验证最小长度', () => {
            const validator = minLength(3, '至少3个字符');
            
            expect(() => validator('abc')).not.toThrow();
            expect(() => validator('abcd')).not.toThrow();
            expect(() => validator('ab')).toThrow('至少3个字符');
        });
    });
    
    describe('maxLength', () => {
        it('应该验证最大长度', () => {
            const validator = maxLength(5, '最多5个字符');
            
            expect(() => validator('abc')).not.toThrow();
            expect(() => validator('abcde')).not.toThrow();
            expect(() => validator('abcdef')).toThrow('最多5个字符');
        });
    });
    
    describe('email', () => {
        it('应该验证有效邮箱', () => {
            const validator = email();
            
            expect(() => validator('test@example.com')).not.toThrow();
            expect(() => validator('user.name@domain.co.uk')).not.toThrow();
        });
        
        it('应该拒绝无效邮箱', () => {
            const validator = email();
            
            expect(() => validator('invalid')).toThrow();
            expect(() => validator('invalid@')).toThrow();
            expect(() => validator('@domain.com')).toThrow();
            expect(() => validator('test@')).toThrow();
        });
    });
    
    describe('phone', () => {
        it('应该验证有效手机号', () => {
            const validator = phone();
            
            expect(() => validator('13812345678')).not.toThrow();
            expect(() => validator('15987654321')).not.toThrow();
        });
        
        it('应该拒绝无效手机号', () => {
            const validator = phone();
            
            expect(() => validator('12345678901')).toThrow();
            expect(() => validator('abcdefghijk')).toThrow();
            expect(() => validator('1381234567')).toThrow();
        });
    });
    
    describe('range', () => {
        it('应该验证数值范围', () => {
            const validator = range(1, 100, '数值必须在1-100之间');
            
            expect(() => validator(1)).not.toThrow();
            expect(() => validator(50)).not.toThrow();
            expect(() => validator(100)).not.toThrow();
            expect(() => validator(0)).toThrow('数值必须在1-100之间');
            expect(() => validator(101)).toThrow();
        });
    });
    
    describe('positiveInteger', () => {
        it('应该验证正整数', () => {
            const validator = positiveInteger();
            
            expect(() => validator(1)).not.toThrow();
            expect(() => validator(100)).not.toThrow();
            expect(() => validator(0)).toThrow();
            expect(() => validator(-1)).toThrow();
            expect(() => validator(1.5)).toThrow();
        });
    });
    
    describe('pattern', () => {
        it('应该验证正则表达式', () => {
            const validator = pattern(/^[a-z]+$/, '只能包含小写字母');
            
            expect(() => validator('abc')).not.toThrow();
            expect(() => validator('ABC')).toThrow('只能包含小写字母');
        });
    });
    
    describe('FormValidator', () => {
        it('应该验证整个表单', () => {
            const validator = new FormValidator({
                username: [required('用户名必填'), minLength(3)],
                email: [required('邮箱必填'), email()],
            });
            
            const result = validator.validate({
                username: 'ab',
                email: 'invalid',
            });
            
            expect(result.isValid).toBe(false);
            expect(result.errors.has('username')).toBe(true);
            expect(result.errors.has('email')).toBe(true);
        });
        
        it('应该验证通过有效数据', () => {
            const validator = new FormValidator({
                username: [required(), minLength(3)],
                email: [required(), email()],
            });
            
            const result = validator.validate({
                username: 'testuser',
                email: 'test@example.com',
            });
            
            expect(result.isValid).toBe(true);
            expect(result.errors.size).toBe(0);
        });
        
        it('应该支持获取单个字段错误', () => {
            const validator = new FormValidator({
                name: [required()],
            });
            
            validator.validate({ name: '' });
            
            expect(validator.getError('name')).toBeTruthy();
        });
        
        it('应该支持清除错误', () => {
            const validator = new FormValidator({
                name: [required()],
            });
            
            validator.validate({ name: '' });
            validator.clearError('name');
            
            expect(validator.getError('name')).toBeNull();
        });
    });
    
    describe('createFormValidator', () => {
        it('应该创建带规则的验证器', () => {
            const validator = createFormValidator({
                name: [required(), minLength(2)],
            });
            
            const result = validator.validate({ name: 'a' });
            
            expect(result.isValid).toBe(false);
        });
    });
});
