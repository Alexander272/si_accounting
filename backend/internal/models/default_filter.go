package models

type DefaultFilter struct {
	Id          string `json:"id" db:"id"`
	FilterName  string `json:"field" db:"filter_name"`
	CompareType string `json:"compareType" db:"compare_type"`
	Value       string `json:"value" db:"value"`
}

type ChangeFilterDTO struct {
	SSOId   string `json:"ssoId" db:"sso_id"`
	Filters []*FilterDTO
}

type FilterDTO struct {
	Id          string `json:"id" db:"id"`
	SSOId       string `json:"ssoId" db:"sso_id"`
	FilterName  string `json:"field" db:"filter_name"`
	CompareType string `json:"compareType" db:"compare_type"`
	Value       string `json:"value" db:"value"`
}

type DeleteFilterDTO struct {
	Id string `json:"id" db:"id"`
}
