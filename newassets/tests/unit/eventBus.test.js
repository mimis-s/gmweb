/**
 * EventBus 模块单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventBus, Events, createEventBus } from '../js/core/eventBus.js';

describe('EventBus 模块', () => {
    let bus;
    
    beforeEach(() => {
        bus = createEventBus();
    });
    
    describe('基本功能', () => {
        it('应该正确绑定和触发事件', () => {
            const callback = vi.fn();
            bus.on('test', callback);
            bus.emit('test', 'data');
            
            expect(callback).toHaveBeenCalledWith('data');
        });
        
        it('应该支持传递多个数据参数', () => {
            const callback = vi.fn();
            bus.on('test', callback);
            bus.emit('test', 'arg1', 'arg2');
            
            expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
        });
        
        it('应该正确解绑事件', () => {
            const callback = vi.fn();
            bus.on('test', callback);
            bus.off('test', callback);
            bus.emit('test');
            
            expect(callback).not.toHaveBeenCalled();
        });
        
        it('应该支持解绑所有事件', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            
            bus.on('test1', callback1);
            bus.on('test2', callback2);
            bus.offAll();
            
            bus.emit('test1');
            bus.emit('test2');
            
            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
        });
    });
    
    describe('一次性事件', () => {
        it('应该只触发一次', () => {
            const callback = vi.fn();
            bus.once('test', callback);
            bus.emit('test');
            bus.emit('test');
            bus.emit('test');
            
            expect(callback).toHaveBeenCalledTimes(1);
        });
        
        it('once 返回的取消函数应该有效', () => {
            const callback = vi.fn();
            const unsubscribe = bus.once('test', callback);
            unsubscribe();
            bus.emit('test');
            
            expect(callback).not.toHaveBeenCalled();
        });
    });
    
    describe('事件监听器管理', () => {
        it('应该正确计算监听器数量', () => {
            bus.on('test', () => {});
            bus.on('test', () => {});
            bus.on('test', () => {});
            
            expect(bus.listenerCount('test')).toBe(3);
        });
        
        it('应该返回所有事件名', () => {
            bus.on('event1', () => {});
            bus.on('event2', () => {});
            bus.on('event3', () => {});
            
            const names = bus.eventNames();
            expect(names).toContain('event1');
            expect(names).toContain('event2');
            expect(names).toContain('event3');
        });
        
        it('应该支持清空特定事件', () => {
            bus.on('test1', () => {});
            bus.on('test2', () => {});
            bus.offAll('test1');
            
            expect(bus.listenerCount('test1')).toBe(0);
            expect(bus.listenerCount('test2')).toBe(1);
        });
    });
    
    describe('优先级', () => {
        it('应该按优先级顺序触发回调', () => {
            const order = [];
            
            bus.on('test', () => order.push(3), { priority: 0 });
            bus.on('test', () => order.push(1), { priority: 100 });
            bus.on('test', () => order.push(2), { priority: 50 });
            
            bus.emit('test');
            
            expect(order).toEqual([1, 2, 3]);
        });
    });
    
    describe('异步事件', () => {
        it('应该支持异步触发', async () => {
            const callback = vi.fn().mockResolvedValue('result');
            
            bus.on('test', callback);
            const results = await bus.emitAsync('test');
            
            expect(results).toEqual(['result']);
        });
        
        it('应该等待所有监听器完成', async () => {
            const callback1 = vi.fn().mockResolvedValue(1);
            const callback2 = vi.fn().mockResolvedValue(2);
            
            bus.on('test', callback1);
            bus.on('test', callback2);
            
            const results = await bus.emitAsync('test');
            
            expect(results).toEqual([1, 2]);
        });
    });
    
    describe('错误处理', () => {
        it('应该捕获事件回调中的错误', () => {
            const errorHandler = vi.fn();
            bus.on('error', errorHandler);
            
            const errorCallback = vi.fn(() => {
                throw new Error('Test error');
            });
            
            bus.on('test', errorCallback);
            bus.emitSafe('test');
            
            // 不应抛出错误
            expect(errorHandler).not.toHaveBeenCalled();
        });
    });
    
    describe('事件常量', () => {
        it('应该导出正确的事件常量', () => {
            expect(Events.APP_READY).toBe('app:ready');
            expect(Events.USER_LOGIN).toBe('user:login');
            expect(Events.USER_LOGOUT).toBe('user:logout');
            expect(Events.DATA_LOADED).toBe('data:loaded');
            expect(Events.DATA_UPDATED).toBe('data:updated');
            expect(Events.DATA_DELETED).toBe('data:deleted');
        });
    });
});
