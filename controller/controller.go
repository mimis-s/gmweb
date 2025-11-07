package controller

import (
	"github.com/gin-gonic/gin"
)

func Index(c *gin.Context) {

	// // 获取天气预报显示
	// weatherUrl := "http://wthrcdn.etouch.cn/weather_mini?city=成都"

	// getWeatherRes, err := http.Get(weatherUrl)
	// if err != nil {
	// 	fmt.Print(err)
	// }
	// body, err := ioutil.ReadAll(getWeatherRes.Body)
	// if err != nil {
	// 	fmt.Print(err)
	// }
	// weather := &model.Weather{}
	// err = json.Unmarshal(body, weather)
	// if err != nil {
	// 	fmt.Print(err)
	// }
	// fmt.Printf("%v\n", weather)
	// for _, i := range weather.Data.Forecast {
	// 	fmt.Printf("%v\n", i)
	// }
	// // 主页面只需要显示当前的天气
	// strDate := ""
	// strDate = strDate + strconv.Itoa(time.Now().UTC().Year()) + "年"
	// strDate = strDate + strconv.Itoa(int(time.Now().UTC().Month())) + "月"
	// strDate = strDate + weather.Data.Forecast[0].Date

	// nowWeather := &model.WeatherMainShow{
	// 	City:           weather.Data.City,
	// 	Date:           strDate,
	// 	High:           weather.Data.Forecast[0].High,
	// 	Low:            weather.Data.Forecast[0].Low,
	// 	Type:           weather.Data.Forecast[0].Type,
	// 	Remind:         weather.Data.Remind,
	// 	CurTemperature: weather.Data.CurTemperature,
	// }
	// nowWeather := &model.WeatherMainShow{
	// 	City:           weather.Data.City,
	// 	Date:           strDate,
	// 	High:           weather.Data.Forecast[0].High,
	// 	Low:            weather.Data.Forecast[0].Low,
	// 	Type:           weather.Data.Forecast[0].Type,
	// 	Remind:         weather.Data.Remind,
	// 	CurTemperature: weather.Data.CurTemperature,
	// }
	c.HTML(200, "index.html", nil)
}

// 登录界面
func Login(c *gin.Context) {
	c.HTML(200, "login.html", nil)
}

// 注册界面
func Register(c *gin.Context) {
	c.HTML(200, "register.html", nil)
}

// 主界面
func Home(c *gin.Context) {
	c.HTML(200, "home.html", nil)
}
