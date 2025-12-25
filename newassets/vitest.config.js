/**
 * 测试配置文件 - Vitest
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // 测试环境
        environment: 'jsdom',
        
        // 全局 API
        globals: true,
        
        // 测试文件匹配模式
        include: ['tests/**/*.test.js'],
        
        // 排除的文件
        exclude: ['node_modules', 'dist', '.git'],
        
        // 覆盖配置
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
        },
        
        // 报告格式
        reporters: ['default', 'html'],
        
        // 测试超时时间
        testTimeout: 10000,
        
        // 是否在 CI 模式下运行
        ci: false,
        
        // 循环重试次数
        retry: 0,
        
        // 允许并行执行
        maxWorkers: '50%',
    },
    
    // 解析配置
    resolve: {
        alias: {
            '@api': './js/api',
            '@core': './js/core',
            '@utils': './js/utils',
            '@components': './js/components',
            '@modules': './js/modules',
        },
    },
});
