package dao

type Dao struct {
}

func Init() (*Dao, error) {
	return &Dao{}, nil
}
