/**
 * 工具函数测试
 */
import { describe, it, expect } from 'vitest';
import * as utils from '../js/utils/index.js';

describe('Utils - DOM 操作', () => {
    describe('createElement', () => {
        it('应该创建带有属性和子元素的元素', () => {
            const element = utils.createElement('div', {
                className: 'test-class',
                id: 'test-id',
                style: { color: 'red' },
            }, 'Hello');
            
            expect(element.tagName).toBe('DIV');
            expect(element.className).toBe('test-class');
            expect(element.id).toBe('test-id');
            expect(element.style.color).toBe('red');
            expect(element.textContent).toBe('Hello');
        });
        
        it('应该支持事件监听器', () => {
            let clicked = false;
            const element = utils.createElement('button', {
                onClick: () => { clicked = true; },
            });
            
            element.click();
            expect(clicked).toBe(true);
        });
        
        it('应该支持 dataset', () => {
            const element = utils.createElement('div', {
                dataset: { userId: '123', action: 'test' },
            });
            
            expect(element.dataset.userId).toBe('123');
            expect(element.dataset.action).toBe('test');
        });
        
        it('应该支持子元素数组', () => {
            const child1 = document.createElement('span');
            const child2 = document.createElement('span');
            
            const element = utils.createElement('div', {}, [child1, child2, 'text']);
            
            expect(element.children.length).toBe(2);
            expect(element.textContent).toContain('text');
        });
    });
    
    describe('addClass / removeClass / hasClass', () => {
        it('应该正确添加类名', () => {
            const element = document.createElement('div');
            utils.addClass(element, ['class1', 'class2']);
            
            expect(element.classList.contains('class1')).toBe(true);
            expect(element.classList.contains('class2')).toBe(true);
        });
        
        it('应该正确移除类名', () => {
            const element = document.createElement('div');
            element.className = 'class1 class2';
            
            utils.removeClass(element, 'class1');
            
            expect(element.classList.contains('class1')).toBe(false);
            expect(element.classList.contains('class2')).toBe(true);
        });
        
        it('应该正确检查类名', () => {
            const element = document.createElement('div');
            element.className = 'test-class';
            
            expect(utils.hasClass(element, 'test-class')).toBe(true);
            expect(utils.hasClass(element, 'other-class')).toBe(false);
        });
    });
    
    describe('toggleClass', () => {
        it('应该切换类名', () => {
            const element = document.createElement('div');
            
            const result1 = utils.toggleClass(element, 'test');
            expect(result1).toBe(true);
            expect(element.classList.contains('test')).toBe(true);
            
            const result2 = utils.toggleClass(element, 'test');
            expect(result2).toBe(false);
            expect(element.classList.contains('test')).toBe(false);
        });
    });
    
    describe('setStyles', () => {
        it('应该批量设置样式', () => {
            const element = document.createElement('div');
            utils.setStyles(element, {
                color: 'red',
                fontSize: '16px',
                display: 'flex',
            });
            
            expect(element.style.color).toBe('red');
            expect(element.style.fontSize).toBe('16px');
            expect(element.style.display).toBe('flex');
        });
    });
    
    describe('debounce', () => {
        it('应该延迟执行函数', () => {
            let count = 0;
            const debouncedFn = utils.debounce(() => { count++; }, 100);
            
            debouncedFn();
            debouncedFn();
            debouncedFn();
            
            expect(count).toBe(0);
        });
    });
    
    describe('throttle', () => {
        it('应该限制函数执行频率', () => {
            let count = 0;
            const throttledFn = utils.throttle(() => { count++; }, 100);
            
            throttledFn();
            throttledFn();
            throttledFn();
            
            expect(count).toBe(1);
        });
    });
    
    describe('formatDate', () => {
        it('应该格式化日期', () => {
            const date = new Date(2024, 0, 15, 10, 30, 45);
            const result = utils.formatDate(date, 'YYYY-MM-DD HH:mm:ss');
            
            expect(result).toBe('2024-01-15 10:30:45');
        });
        
        it('应该处理时间戳', () => {
            const timestamp = 1705315845000;
            const result = utils.formatDate(timestamp, 'YYYY-MM-DD');
            
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });
});
