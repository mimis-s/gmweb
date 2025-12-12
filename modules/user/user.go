package user

import (
	"fmt"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
	"github.com/mimis-s/gmweb/lib/encrypt"
)

func GetAllUsersHandler(ctx *web.WebContext, req *webmodel.GetAllUsersReq, rsp *webmodel.GetAllUsersRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v get all user, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	userDBDatas, err := dao.GetAllUserDataByRole(define.EnumRole_Regular)
	if err != nil {
		dao.Error(ctx, "user:%v name:%v get all user is err:%v", user.Rid, user.Name, err)
		return err
	}

	rsp.Datas = make([]*webmodel.User, 0, len(userDBDatas))
	for _, data := range userDBDatas {
		passwd, _ := encrypt.Decrypt(data.Password)
		rsp.Datas = append(rsp.Datas, &webmodel.User{
			UserId:   data.Rid,
			Name:     data.Name,
			Password: passwd,
		})
	}
	dao.Info(ctx, "get all regular users info")
	return nil
}

func AddUserHandler(ctx *web.WebContext, req *webmodel.AddUserReq, rsp *webmodel.AddUserRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v add user, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	// 检查重名
	_, find, err := dao.GetUserDataByName(req.Name)
	if err != nil {
		dao.Error(ctx, "user:%v add user:%v is err:%v", user.Rid, req.Name, err)
		return err
	}

	if find {
		err := fmt.Errorf("user:%v add user:%v name is repeated", user.Rid, req.Name)
		dao.Error(ctx, err.Error())
		return err
	}

	passwd, err := encrypt.Encrypt(req.Password)
	if err != nil {
		dao.Error(ctx, "user:%v add user:%v passwd:%v is err:%v", user.Rid, req.Name, req.Password, err)
		return err
	}

	insertData := &dbmodel.User{
		Name:     req.Name,
		Password: passwd,
		Role:     int(define.EnumRole_Regular),
	}

	err = dao.InsertUserData(insertData)
	if err != nil {
		dao.Error(ctx, "user:%v add user:%v passwd:%v insert db is err:%v", user.Rid, req.Name, req.Password, err)
		return err
	}
	rsp.Data = &webmodel.User{
		UserId:   insertData.Rid,
		Name:     req.Name,
		Password: req.Password,
	}
	dao.Info(ctx, "add user:%v name:%v passwd:%v is ok", insertData.Rid, req.Name, req.Password)

	return nil
}

func DelUserHandler(ctx *web.WebContext, req *webmodel.DelUserReq, rsp *webmodel.DelUserRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v del user, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	delUser, find, err := dao.GetUserData(req.UserId)
	if err != nil {
		dao.Error(ctx, "user:%v del user:%v is err:%v", user.Rid, req.UserId, err)
		return err
	}

	if !find {
		// 找不到不会给客户端报错
		dao.Error(ctx, "user:%v del user:%v is not found", user.Rid, req.UserId)
		rsp.UserId = req.UserId
		return nil
	}

	err = dao.DelUserData(req.UserId)
	if err != nil {
		dao.Error(ctx, "user:%v del user:%v name:%v is err:%v", user.Rid, req.UserId, delUser.Name, err)
		return err
	}

	rsp.UserId = req.UserId

	dao.Info(ctx, "del user:%v name:%v is ok", req.UserId, delUser.Name)

	return nil
}

func ModifyUserHandler(ctx *web.WebContext, req *webmodel.ModifyUserReq, rsp *webmodel.ModifyUserRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v modify user, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	modifyUser, find, err := dao.GetUserData(req.UserId)
	if err != nil {
		dao.Error(ctx, "user:%v modify user:%v is err:%v", user.Rid, req.UserId, err)
		return err
	}

	if !find {
		dao.Error(ctx, "user:%v modify user:%v name:%v is not found", user.Rid, req.UserId, req.Name)
		return fmt.Errorf("user:%v modify user:%v name:%v is not found", user.Rid, req.UserId, req.Name)
	}

	passwd, err := encrypt.Encrypt(req.Password)
	if err != nil {
		dao.Error(ctx, "user:%v modify user:%v passwd:%v is err:%v", user.Rid, req.Name, req.Password, err)
		return err
	}

	if modifyUser.Name != req.Name || modifyUser.Password != passwd {
		modifyUser.Name = req.Name
		modifyUser.Password = passwd
		err = dao.UpdateUserData(req.UserId, modifyUser)
		if err != nil {
			dao.Error(ctx, "user:%v modify user:%v is err:%v", user.Rid, req.UserId, err)
			return err
		}
	}

	rsp.Data = &webmodel.User{
		UserId:   req.UserId,
		Name:     req.Name,
		Password: req.Password,
	}
	dao.Info(ctx, "modify user:%v name:%v passwd:%v is ok", req.UserId, req.Name, req.Password)

	return nil
}
