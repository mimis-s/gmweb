package dbmodel

import "encoding/json"

func (tb *User) SubName() string {
	return "user"
}

func (tb *User) String() string {
	data, err := json.Marshal(tb)
	if err != nil {
		return err.Error()
	}
	return string(data)
}

func (tb *PowerGroup) SubName() string {
	return "power_group"
}

func (tb *PowerGroup) String() string {
	data, err := json.Marshal(tb)
	if err != nil {
		return err.Error()
	}
	return string(data)
}

func (tb *Power) SubName() string {
	return "power"
}

func (tb *Power) String() string {
	data, err := json.Marshal(tb)
	if err != nil {
		return err.Error()
	}
	return string(data)
}

func (tb *GmOrder) SubName() string {
	return "gm_order"
}

func (tb *GmOrder) String() string {
	data, err := json.Marshal(tb)
	if err != nil {
		return err.Error()
	}
	return string(data)
}

func (tb *Project) SubName() string {
	return "project"
}

func (tb *Project) String() string {
	data, err := json.Marshal(tb)
	if err != nil {
		return err.Error()
	}
	return string(data)
}

func (tb *OperationLog) SubName() string {
	return "operation_log"
}

func (tb *OperationLog) String() string {
	data, err := json.Marshal(tb)
	if err != nil {
		return err.Error()
	}
	return string(data)
}

func (tb *PowerAssignMent) SubName() string {
	return "power_assign_ment"
}

func (tb *PowerAssignMent) String() string {
	data, err := json.Marshal(tb)
	if err != nil {
		return err.Error()
	}
	return string(data)
}

func (tb *Review) SubName() string {
	return "review"
}

func (tb *Review) String() string {
	data, err := json.Marshal(tb)
	if err != nil {
		return err.Error()
	}
	return string(data)
}
