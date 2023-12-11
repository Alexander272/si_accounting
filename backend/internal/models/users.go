package models

type User struct {
	Id string `json:"id" db:"id"`
	// DepartmentId только для db
	Name string `json:"name" db:"name"`
	// Type string => member or leader
	IncludeDepartments []string `json:"includeDepartments" db:"include_departments"`
	DefaultFilters     string   // TODO определиться с типом и форматом фильтров
	MattermostId       string   `json:"mattermostId" db:"most_id"` //TODO возможно на клиенте это мне не нужно будет
}
