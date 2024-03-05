package models

type DefaultFilter struct {
	Id          string `json:"id" db:"id"`
	FilterName  string `json:"field" db:"filter_name"`
	CompareType string `json:"compareType" db:"compare_type"`
	Value       string `json:"valueStart" db:"value"`
}
