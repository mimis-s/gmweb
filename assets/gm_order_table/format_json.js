// 将json数据格式化输出到屏幕

// 格式化JSON
function formatJSON(inputStr, output, warnLabel) {
    try {
        warnLabel.textContent = '';
        const inputText = inputStr.trim();
        
        if (!inputText) {
            output.textContent = '';
            return;
        }
        
        const parsedJson = JSON.parse(inputText);
        output.innerHTML = syntaxHighlight(parsedJson);
    } catch (error) {
        warnLabel.textContent = '错误：无效的JSON格式 - ' + error.message;
    }
}

// 语法高亮
function syntaxHighlight(json) {
    if (typeof json !== 'object' || json === null) {
        return formatValue(json);
    }
    
    return formatObject(json, true);
}

// 格式化对象
function formatObject(obj, isRoot = false) {
    const isArray = Array.isArray(obj);
    const entries = isArray ? obj : Object.entries(obj);
    
    if (entries.length === 0) {
        return isArray ? '[]' : '{}';
    }
    
    let html = isArray ? '[' : '{';
    html += '<div class="json-children">';
    
    for (let i = 0; i < entries.length; i++) {
        const key = isArray ? i : entries[i][0];
        const value = isArray ? entries[i] : entries[i][1];
        
        html += '<div>';
        
        if (!isArray) {
            html += `<span class="json-key">"${key}"</span><span class="json-punctuation">: </span>`;
        }
        
        html += formatValue(value);
        
        if (i < entries.length - 1) {
            html += '<span class="json-punctuation">,</span>';
        }
        
        html += '</div>';
    }
    
    html += '</div>';
    html += `<span class="json-punctuation">${isArray ? ']' : '}'}</span>`;
    
    if (isRoot) {
        html = `<div class="json-object">${html}</div>`;
    }
    
    return html;
}

// 格式化值
function formatValue(value) {
    if (value === null) {
        return '<span class="json-null">null</span>';
    }
    
    if (typeof value === 'boolean') {
        return `<span class="json-boolean">${value}</span>`;
    }
    
    if (typeof value === 'number') {
        return `<span class="json-number">${value}</span>`;
    }
    
    if (typeof value === 'string') {
        return `<span class="json-string">"${value}"</span>`;
    }
    
    if (typeof value === 'object') {
        if (Object.keys(value).length === 0) {
            return Array.isArray(value) ? '<span class="json-punctuation">[]</span>' : '<span class="json-punctuation">{}</span>';
        }
        
        const toggleSpan = '<span class="toggle">-</span>';
        return toggleSpan + formatObject(value);
    }
    
    return String(value);
}