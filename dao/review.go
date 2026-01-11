package dao

import "github.com/mimis-s/gmweb/common/dbmodel"

func GetReviewData(id int64) (*dbmodel.Review, bool, error) {
	ret := &dbmodel.Review{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubName()).Where("id=?", id).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

type ReviewDBInfo struct {
	ReviewDB    *dbmodel.Review `xorm:"extends"`
	ProjectName string          `json:"projectname"`
	OrderName   string          `json:"ordername"`
	OrderDesc   string          `json:"orderdesc"`
	UserName    string          `json:"username"`
}

func (ReviewDBInfo) TableName() string {
	return "review"
}

func FindReviewDatas(projectId int64, orderIds []int64, startTime int64, endTime int64) ([]*ReviewDBInfo, error) {
	rets := make([]*ReviewDBInfo, 0)
	err := daoHandler.db.ReadEngine().Table((&ReviewDBInfo{}).TableName()).
		Select("review.*,project.name as projectname,order.name as ordername,order.desc as orderdesc,user.name as username").
		Join("INNER", "project", "review.project_id = project.id").
		Join("INNER", "order", "review.order_id = order.id").
		Join("INNER", "user", "review.user_id = user.id").
		Where("project_id = ? and start_date >= ? and  start_date <= ?", projectId, startTime, endTime).
		In("order_id", orderIds).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

// 单个用户只能查询最新的50条命令
func FindReviewByUserDatas(userId int64, orderId int64) ([]*ReviewDBInfo, error) {
	rets := make([]*ReviewDBInfo, 0)
	err := daoHandler.db.ReadEngine().Table((&ReviewDBInfo{}).TableName()).
		Select("review.*,project.name as projectname,order.name as ordername,user.name as username").
		Join("INNER", "project", "review.project_id = project.id").
		Join("INNER", "order", "review.order_id = order.id").
		Join("INNER", "user", "review.user_id = user.id").
		Where("user_id = ? and order_id = ?", userId, orderId).
		Desc("start_date").Limit(50).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func UpdateReviewData(id int64, data *dbmodel.Review) error {
	_, err := daoHandler.db.Table((&dbmodel.Review{}).SubName()).Where("id=?", id).Update(data)
	if err != nil {
		return err
	}
	return nil
}

func InsertReviewData(data *dbmodel.Review) error {
	_, err := daoHandler.db.Table((&dbmodel.Review{}).SubName()).Insert(data)
	if err != nil {
		return err
	}
	return nil
}
