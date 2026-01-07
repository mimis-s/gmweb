// gm命令的json解析

// 渲染JSON表单
export function renderJSONForm(jsonOutput, data, parentKey = '') {
    jsonOutput.innerHTML = '';
    
    if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
            renderArray(jsonOutput, data, parentKey);
        } else {
            renderObject(jsonOutput,data, parentKey);
        }
    } else {
        jsonOutput.innerHTML = '<p>JSON 数据格式不正确</p>';
    }
}

// 渲染数组
export function renderArray(jsonOutput, arr, parentKey) {
    const container = document.createElement('div');
    container.className = 'json-array struct_box';
    
    arr.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'json-array-item';
        
        const indexElement = document.createElement('span');
        indexElement.className = 'json-key card_form_label';
        indexElement.textContent = `[${index}]:`;
        
        itemElement.appendChild(indexElement);
        
        const valueElement = document.createElement('div');
        valueElement.className = 'json-value';
        
        if (typeof item === 'object' && item !== null) {
            if (Array.isArray(item)) {
                renderArrayField(item, valueElement, `${parentKey}[${index}]`);
            } else {
                renderObjectField(item, valueElement, `${parentKey}[${index}]`);
            }
        } else {
            renderPrimitiveField(item, valueElement, `${parentKey}[${index}]`);
        }
        itemElement.appendChild(valueElement);
        container.appendChild(itemElement);
    });
    
    jsonOutput.appendChild(container);
}

// 渲染数组字段
export function renderArrayField(arr, container, key) {
    const arrayContainer = document.createElement('div');
    arrayContainer.className = 'json-array struct_box';

    // 数组不解析, 直接输出
    // arr.forEach((item, index) => {
    //     const itemElement = document.createElement('div');
    //     itemElement.className = 'json-array-item';
    //
    //     const input = createInputForValue(item, `${key}[${index}]`);
    //     itemElement.appendChild(input);
    //
    //     arrayContainer.appendChild(itemElement);
    // });
    const itemElement = document.createElement('div');
    itemElement.className = 'json-array-item';

    const input = createInputForValue(arr, `${key}`);
    itemElement.appendChild(input);

    arrayContainer.appendChild(itemElement);

    container.appendChild(arrayContainer);
}

// 渲染对象字段
export function renderObjectField(obj, container, key) {
    const objectContainer = document.createElement('div');
    objectContainer.className = 'json-object';
    
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            const field = document.createElement('div');
            field.className = 'json-field';
            
            const propElement = document.createElement('span');
            propElement.className = 'json-key card_form_label';
            propElement.textContent = prop + ':';
            
            field.appendChild(propElement);
            
            const valueElement = document.createElement('div');
            valueElement.className = 'json-value';
            if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                if (Array.isArray(obj[prop])) {
                    renderArrayField(obj[prop], valueElement, `${key}.${prop}`);
                } else {
                    renderObjectField(obj[prop], valueElement, `${key}.${prop}`);
                }
            } else {
                renderPrimitiveField(obj[prop], valueElement, `${key}.${prop}`);
            }
            
            field.appendChild(valueElement);
            objectContainer.appendChild(field);
        }
    }
    
    container.appendChild(objectContainer);
}

// 渲染基本类型字段
export function renderPrimitiveField(value, container, key) {
    const input = createInputForValue(value, key);
    container.appendChild(input);
}

export function objectToString(obj, indent = '  ', depth = 0) {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';

    const type = typeof obj;

    // 基本类型直接返回
    if (type !== 'object' && type !== 'export function') {
        if (type === 'string') return `"${obj}"`;
        return String(obj);
    }

    // 如果是数组
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';

        let result = '[\n';
        for (let i = 0; i < obj.length; i++) {
            const prefix = indent.repeat(depth + 1);
            result += prefix + objectToString(obj[i], indent, depth + 1);
            if (i < obj.length - 1) result += ',';
            result += '\n';
        }
        result += indent.repeat(depth) + ']';
        return result;
    }

    // 如果是普通对象
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';

    let result = '{\n';
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const prefix = indent.repeat(depth + 1);
        result += prefix + key + ': ';
        result += objectToString(obj[key], indent, depth + 1);
        if (i < keys.length - 1) result += ',';
        result += '\n';
    }
    result += indent.repeat(depth) + '}';
    return result;
}

// 创建对应类型的输入框
export function createInputForValue(value, key) {
    let input;
    
    if (typeof value === 'string') {
        if (value.length > 50 || value.includes('\n')) {
            input = document.createElement('textarea');
            input.value = value;
            input.placeholder = '请输入文本...';
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = value;
            input.placeholder = '请输入文本...';
            input.placeholder = '请输入文本...';
        }
        input.className = 'json-string card_form_input';
    } else if (typeof value === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.className = 'json-number card_form_input';
    } else if (typeof value === 'boolean') {
        input = document.createElement('select');
        input.className = 'json-boolean card_form_input';
        
        const trueOption = document.createElement('option');
        trueOption.value = 'true';
        trueOption.textContent = 'true';
        
        const falseOption = document.createElement('option');
        falseOption.value = 'false';
        falseOption.textContent = 'false';
        
        input.appendChild(trueOption);
        input.appendChild(falseOption);
        input.value = value.toString();
    } else if (typeof value == "object"){
        var val = JSON.stringify(value);
        input = document.createElement('input');
        input.id = "json_input";
        input.value = val;
        input.type = 'text';
        input.className = 'json-string card_form_input';
    } else if (value === null) {
        input = document.createElement('input');
        input.type = 'text';
        input.value = 'null';
        input.disabled = true;
        input.className = 'json-null card_form_input';
    } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = String(value);
        input.className = 'json-string card_form_input';
    }
    
    input.setAttribute('data-key', key);
    
    return input;
}

// 设置嵌套值
export function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        
        // 处理数组索引
        const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
        if (arrayMatch) {
            const arrayKey = arrayMatch[1];
            const arrayIndex = parseInt(arrayMatch[2]);
            
            if (!current[arrayKey]) {
                current[arrayKey] = [];
            }
            if (i === keys.length - 1) {
                current[arrayKey][arrayIndex] = value;
            } else {
                if (!current[arrayKey][arrayIndex]) {
                    current[arrayKey][arrayIndex] = {};
                }
                current = current[arrayKey][arrayIndex];
            }
        } else {
            if (i === keys.length - 1) {
                current[key] = value;
            } else {
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key];
            }
        }
    }
}


// 渲染对象
export function renderObject(jsonOutput, obj, parentKey) {
    const container = document.createElement('div');
    container.className = 'json-object';
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const field = document.createElement('div');
            field.className = 'json-field struct_box';
            
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            
            const keyElement = document.createElement('span');
            keyElement.className = 'json-key card_form_label';
            keyElement.textContent = key + ':';
            
            field.appendChild(keyElement);
            
            const valueElement = document.createElement('div');
            valueElement.className = 'json-value';
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (Array.isArray(obj[key])) {
                    renderArrayField(obj[key], valueElement, fullKey);
                } else {
                    renderObjectField(obj[key], valueElement, fullKey);
                }
            } else {
                renderPrimitiveField(obj[key], valueElement, fullKey);
            }
            
            field.appendChild(valueElement);
            container.appendChild(field);
        }
    }
    
    jsonOutput.appendChild(container);
}

// 获取表单数据
export function getFormData(jsonOutput) {
    const inputs = jsonOutput.querySelectorAll('input, textarea, select');
    const data = {};
    
    inputs.forEach(input => {
        const key = input.getAttribute('data-key');
        if (key) {
            setNestedValue(data, key, getInputValue(input));
        }
    });
    
    return data;
}

// 获取输入值
export function getInputValue(input) {
    console.debug("输入类型:",input.type)
    if (input.id === "json_input") {
        var val = JSON.parse(input.value);
        return val;
    } else if (input.tagName === 'SELECT') {
        return input.value === 'true';
    } else if (input.type === 'number') {
        return parseFloat(input.value);
    } else {
        return input.value;
    }
}