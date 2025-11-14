package webmodel

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Remember string `json:"remember"`
}
