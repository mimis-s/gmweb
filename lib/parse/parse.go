package parse

import "strconv"

func StringToInt64(str string) int64 {
	ret, _ := strconv.ParseInt(str, 10, 64)
	return ret
}

func Int64ToString(val int64) string {
	return strconv.FormatInt(val, 10)
}

func SliceInt64ToInt(vals []int64) []int {
	rets := make([]int, 0)
	for _, v := range vals {
		rets = append(rets, int(v))
	}
	return rets
}
func SliceIntToInt64(vals []int) []int64 {
	rets := make([]int64, 0)
	for _, v := range vals {
		rets = append(rets, int64(v))
	}
	return rets
}
