package db_extra

type CustomInfo struct {
	Ip         string `db:"ip" json:"ip,omitempty"`
	Power      int
	LoginTime  int64 `db:"logintime" json:"logintime,omitempty"`
	LogoutTime int64 `db:"logouttime" json:"logouttime,omitempty"`
}
