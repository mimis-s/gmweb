/**
 * 验证工具函数
 */

/**
 * 验证器工厂
 * @param {Function} validator 验证函数
 * @param {string} message 错误信息
 * @returns {Function}
 */
export function validator(validator, message) {
    return (value) => {
        const result = validator(value);
        if (!result) {
            throw new Error(message);
        }
        return result;
    };
}

/**
 * 必填验证
 * @param {string} message 错误信息
 */
export function required(message = '该项为必填') {
    return validator((value) => {
        if (value === null || value === undefined || value === '') {
            return false;
        }
        if (Array.isArray(value) && value.length === 0) {
            return false;
        }
        return true;
    }, message);
}

/**
 * 最小长度验证
 * @param {number} min 最小长度
 * @param {string} message 错误信息
 */
export function minLength(min, message) {
    return validator((value) => {
        return String(value).length >= min;
    }, message || `长度不能少于 ${min} 个字符`);
}

/**
 * 最大长度验证
 * @param {number} max 最大长度
 * @param {string} message 错误信息
 */
export function maxLength(max, message) {
    return validator((value) => {
        return String(value).length <= max;
    }, message || `长度不能超过 ${max} 个字符`);
}

/**
 * 邮箱验证
 * @param {string} message 错误信息
 */
export function email(message = '请输入有效的邮箱地址') {
    return validator((value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(String(value));
    }, message);
}

/**
 * 手机号验证
 * @param {string} message 错误信息
 */
export function phone(message = '请输入有效的手机号') {
    return validator((value) => {
        const regex = /^1[3-9]\d{9}$/;
        return regex.test(String(value));
    }, message);
}

/**
 * 数字范围验证
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @param {string} message 错误信息
 */
export function range(min, max, message) {
    return validator((value) => {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }, message || `数值必须在 ${min} 到 ${max} 之间`);
}

/**
 * 正整数验证
 * @param {string} message 错误信息
 */
export function positiveInteger(message = '请输入正整数') {
    return validator((value) => {
        const num = Number(value);
        return Number.isInteger(num) && num > 0;
    }, message);
}

/**
 * 自定义正则验证
 * @param {RegExp} regex 正则表达式
 * @param {string} message 错误信息
 */
export function pattern(regex, message = '格式不正确') {
    return validator((value) => {
        return regex.test(String(value));
    }, message);
}

/**
 * 表单验证器类
 */
export class FormValidator {
    constructor(fields = {}) {
        this.fields = fields;
        this.errors = new Map();
    }

    /**
     * 添加字段验证规则
     * @param {string} name 字段名
     * @param {Array} rules 验证规则数组
     */
    addField(name, rules) {
        this.fields[name] = rules;
    }

    /**
     * 验证单个字段
     * @param {string} name 字段名
     * @param {*} value 字段值
     * @returns {string|null} 错误信息
     */
    validateField(name, value) {
        const rules = this.fields[name];
        if (!rules) return null;
        
        for (const rule of rules) {
            try {
                rule(value);
            } catch (error) {
                return error.message;
            }
        }
        
        return null;
    }

    /**
     * 验证整个表单
     * @param {Object} data 表单数据
     * @returns {Object} 验证结果 { isValid: boolean, errors: Map }
     */
    validate(data) {
        this.errors.clear();
        let isValid = true;
        
        for (const [name, rules] of Object.entries(this.fields)) {
            const error = this.validateField(name, data[name]);
            if (error) {
                this.errors.set(name, error);
                isValid = false;
            }
        }
        
        return {
            isValid,
            errors: this.errors,
        };
    }

    /**
     * 获取错误信息
     * @param {string} name 字段名
     * @returns {string|null}
     */
    getError(name) {
        return this.errors.get(name) || null;
    }

    /**
     * 清除错误
     * @param {string} name 字段名
     */
    clearError(name) {
        if (name) {
            this.errors.delete(name);
        } else {
            this.errors.clear();
        }
    }
}

/**
 * 创建常用表单验证器
 * @param {Object} config 配置
 * @returns {FormValidator}
 */
export function createFormValidator(config) {
    const validator = new FormValidator();
    
    for (const [name, rules] of Object.entries(config)) {
        validator.addField(name, rules);
    }
    
    return validator;
}
