package model

// 昨天的天气
type WeatherDataYesterday struct {
	Date string `json:"date"` // 时间
	High string `json:"high"` // 最高温度
	FX   string `json:"fx"`   // 风向
	Low  string `json:"low"`  // 最低温度
	FL   string `json:"fl"`   // 风力
	Type string `json:"type"` // 天气
}

// 今天-未来五天的天气
type WeatherDataNextFiveDays struct {
	Date      string `json:"date"`      // 时间
	High      string `json:"high"`      // 最高温度
	FengXiang string `json:"fengxiang"` // 风向
	Low       string `json:"low"`       // 最低温度
	FengLi    string `json:"fengli"`    // 风力
	Type      string `json:"type"`      // 天气
}

type WeatherData struct {
	Yesterday      WeatherDataYesterday       `json:"yesterday"` // 昨天的天气
	City           string                     `json:"city"`      // 城市
	Forecast       []*WeatherDataNextFiveDays `json:"forecast"`  // 未来五天的天气
	Remind         string                     `json:"ganmao"`    // 感冒提醒
	CurTemperature string                     `json:"wendu"`     // 当前温度
}

type Weather struct {
	Data   WeatherData `json:"data"`   // 天气情况
	Status int32       `json:"status"` // 状态码
	Desc   string      `json:"desc"`   // 连接描述
}

type WeatherMainShow struct {
	City           string `json:"city"`   // 城市
	Date           string `json:"date"`   // 时间
	High           string `json:"high"`   // 最高温度
	Low            string `json:"low"`    // 最低温度
	Type           string `json:"type"`   // 天气
	Remind         string `json:"ganmao"` // 感冒提醒
	CurTemperature string `json:"wendu"`  // 当前温度
}
