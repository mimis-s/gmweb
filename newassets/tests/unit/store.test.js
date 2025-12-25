/**
 * Store 模块单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store, createStore } from '../js/core/store.js';

describe('Store 模块', () => {
    describe('基本功能', () => {
        it('应该正确初始化状态', () => {
            const testStore = createStore({ count: 0, name: 'test' });
            expect(testStore.get('count')).toBe(0);
            expect(testStore.get('name')).toBe('test');
        });
        
        it('应该正确设置状态值', () => {
            const testStore = createStore();
            testStore.set('count', 10);
            testStore.set('name', 'hello');
            
            expect(testStore.get('count')).toBe(10);
            expect(testStore.get('name')).toBe('hello');
        });
        
        it('应该正确获取嵌套状态', () => {
            const testStore = createStore({
                user: {
                    name: 'test',
                    profile: {
                        age: 25
                    }
                }
            });
            
            expect(testStore.get('user.name')).toBe('test');
            expect(testStore.get('user.profile.age')).toBe(25);
        });
        
        it('应该正确批量设置状态', () => {
            const testStore = createStore();
            testStore.patch({ a: 1, b: 2, c: 3 });
            
            expect(testStore.get('a')).toBe(1);
            expect(testStore.get('b')).toBe(2);
            expect(testStore.get('c')).toBe(3);
        });
    });
    
    describe('订阅功能', () => {
        it('应该正确订阅状态变化', () => {
            const testStore = createStore({ count: 0 });
            const callback = vi.fn();
            
            testStore.subscribe('count', callback);
            testStore.set('count', 10);
            
            expect(callback).toHaveBeenCalledWith(10, 0, 'count');
        });
        
        it('应该正确订阅任意状态变化', () => {
            const testStore = createStore({ a: 1, b: 2 });
            const callback = vi.fn();
            
            testStore.subscribeAny(callback);
            testStore.set('a', 10);
            testStore.set('b', 20);
            
            expect(callback).toHaveBeenCalledTimes(2);
        });
        
        it('应该正确取消订阅', () => {
            const testStore = createStore({ count: 0 });
            const callback = vi.fn();
            
            const unsubscribe = testStore.subscribe('count', callback);
            unsubscribe();
            testStore.set('count', 10);
            
            expect(callback).not.toHaveBeenCalled();
        });
        
        it('应该支持一次性订阅', () => {
            const testStore = createStore({ count: 0 });
            const callback = vi.fn();
            
            testStore.subscribe('count', callback, { once: true });
            testStore.set('count', 10);
            testStore.set('count', 20);
            
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('状态历史', () => {
        it('应该保存状态历史', () => {
            const testStore = createStore({ count: 0 });
            
            testStore.set('count', 1);
            testStore.set('count', 2);
            
            const history = testStore.getHistory();
            expect(history.length).toBe(2);
        });
        
        it('应该支持撤销操作', () => {
            const testStore = createStore({ count: 0 });
            
            testStore.set('count', 10);
            const result = testStore.undo();
            
            expect(result).toBe(true);
            expect(testStore.get('count')).toBe(0);
        });
        
        it('撤销时应该返回 false 如果没有历史', () => {
            const testStore = createStore();
            const result = testStore.undo();
            
            expect(result).toBe(false);
        });
    });
    
    describe('重置功能', () => {
        it('应该正确重置状态', () => {
            const testStore = createStore({ a: 1, b: 2 });
            testStore.set('a', 100);
            
            testStore.reset({ c: 3 });
            
            expect(testStore.get('a')).toBeUndefined();
            expect(testStore.get('c')).toBe(3);
        });
    });
});
