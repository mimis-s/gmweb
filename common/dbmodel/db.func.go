package dbmodel

import "encoding/json"

func (tb *Role) SubName() string {
	return "role"
}

func (tb *Role) String() string {
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
