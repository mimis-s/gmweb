// gm命令的json解析

// 渲染JSON表单
function renderJSONForm(data, parentKey = '') {
    jsonOutput.innerHTML = '';
    
    if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
            renderArray(data, parentKey);
        } else {
            renderObject(data, parentKey);
        }
    } else {
        jsonOutput.innerHTML = '<p>JSON 数据格式不正确</p>';
    }
}

// 渲染数组
function renderArray(arr, parentKey) {
    const container = document.createElement('div');
    container.className = 'json-array';
    
    arr.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'json-array-item';
        
        const indexElement = document.createElement('span');
        indexElement.className = 'json-key';
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
function renderArrayField(arr, container, key) {
    const arrayContainer = document.createElement('div');
    arrayContainer.className = 'json-array';
    
    arr.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'json-array-item';
        
        const input = createInputForValue(item, `${key}[${index}]`);
        itemElement.appendChild(input);
        
        arrayContainer.appendChild(itemElement);
    });
    
    container.appendChild(arrayContainer);
}

// 渲染对象字段
function renderObjectField(obj, container, key) {
    const objectContainer = document.createElement('div');
    objectContainer.className = 'json-object';
    
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            const field = document.createElement('div');
            field.className = 'json-field';
            
            const propElement = document.createElement('span');
            propElement.className = 'json-key';
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
function renderPrimitiveField(value, container, key) {
    const input = createInputForValue(value, key);
    container.appendChild(input);
}

// 创建对应类型的输入框
function createInputForValue(value, key) {
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
        }
        input.className = 'json-string';
    } else if (typeof value === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.className = 'json-number';
    } else if (typeof value === 'boolean') {
        input = document.createElement('select');
        input.className = 'json-boolean';
        
        const trueOption = document.createElement('option');
        trueOption.value = 'true';
        trueOption.textContent = 'true';
        
        const falseOption = document.createElement('option');
        falseOption.value = 'false';
        falseOption.textContent = 'false';
        
        input.appendChild(trueOption);
        input.appendChild(falseOption);
        input.value = value.toString();
    } else if (value === null) {
       input = document.createElement('input');
        input.type = 'text';
        input.value = 'null';
        input.disabled = true;
        input.className = 'json-null';
    } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = String(value);
        input.className = 'json-string';
    }
    
    input.setAttribute('data-key', key);
    
    return input;
}

// 设置嵌套值
function setNestedValue(obj, path, value) {
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
function renderObject(obj, parentKey) {
    const container = document.createElement('div');
    container.className = 'json-object';
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const field = document.createElement('div');
            field.className = 'json-field';
            
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            
            const keyElement = document.createElement('span');
            keyElement.className = 'json-key';
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

// 更新预览
function updatePreview(data) {
    previewContent.innerHTML = '';
    
    if (typeof data === 'object' && data !== null) {
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(data, null, 2);
        previewContent.appendChild(pre);
    } else {
        previewContent.innerHTML = '<p>没有数据可预览</p>';
    }
}

// 显示成功消息
function showSuccess(message) {
    if (message) {
        successMessage.querySelector('strong').textContent = '成功：' + message;
    }
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}