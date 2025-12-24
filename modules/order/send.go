package order

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/dao"
)

// c3项目的特殊操作, 会在json的基础上再封装一层json
type gmExecReq struct {
	GMArgs string `json:"gmArgs"`
}

type ApiResponse struct {
	Data interface{} `json:"data"`
}

// 发送POST JSON请求（增强版）
func SendPostGmOrder(ctx *web.WebContext, ip string, jsonData string, token string) (*ApiResponse, error) {
	// 创建带超时的HTTP客户端
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 10,
			IdleConnTimeout:     90 * time.Second,
		},
	}

	// 创建请求
	req, err := http.NewRequest("POST", ip, bytes.NewBuffer([]byte(jsonData)))
	if err != nil {
		dao.Error(ctx, "创建请求失败: %v", err)
		return nil, fmt.Errorf("创建请求失败")
	}

	// 设置请求头
	req.Header.Set("Content-Type", "application/json")

	// 添加认证信息
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	// 发送请求
	resp, err := client.Do(req)
	if err != nil {
		dao.Error(ctx, "发送请求失败: %v", err)
		return nil, fmt.Errorf("发送请求失败")
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			dao.Error(ctx, "关闭响应体失败: %v", err)
		}
	}()

	// 检查HTTP状态码
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		dao.Error(ctx, "err: %v, 响应: %s", resp.Status, string(body))
		return nil, fmt.Errorf("err: %s, 响应: %s", resp.Status, string(body))
	}

	// 读取响应体
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		dao.Error(ctx, "读取响应体失败: %v", err)
		return nil, fmt.Errorf("读取响应体失败: %v", err)
	}

	// 尝试解析为JSON
	var result ApiResponse
	if err := json.Unmarshal(body, &result.Data); err != nil {
		// 如果不是JSON格式，返回原始响应
		result = ApiResponse{
			Data: string(body),
		}
	}

	return &result, nil
}

// GET请求，使用结构体参数
func SendGetGmOrder(ctx *web.WebContext, ip string, jsonData string) (*ApiResponse, error) {
	// 将结构体转换为查询参数
	query := url.Values{}

	// 解析为map
	var paramMap map[string]interface{}
	if err := json.Unmarshal([]byte(jsonData), &paramMap); err != nil {
		dao.Error(ctx, "解析参数失败: %v", err)
		return nil, fmt.Errorf("解析参数失败: %v", err)
	}

	// 添加到查询参数
	for key, value := range paramMap {
		if value != nil {
			query.Add(key, fmt.Sprintf("%v", value))
		}
	}

	// 构建完整URL
	fullURL := ip
	if len(query) > 0 {
		fullURL = ip + "?" + query.Encode()
	}

	// 发送请求
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Get(fullURL)
	if err != nil {
		dao.Error(ctx, "发送请求失败: %v", err)
		return nil, fmt.Errorf("发送请求失败: %v", err)

	}
	defer resp.Body.Close()

	// 处理响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		dao.Error(ctx, "读取响应失败: %v", err)
		return nil, fmt.Errorf("读取响应失败: %v", err)
	}

	var result ApiResponse
	if err := json.Unmarshal(body, &result); err != nil {
		dao.Error(ctx, "解析响应失败: %v", err)
		return nil, fmt.Errorf("解析响应失败: %v", err)
	}

	return &result, nil
}
