package models

type Employee struct {
	Id string `json:"id" db:"id"`
	// DepartmentId только для db
	Name string `json:"name" db:"name"`
	// Type string => member or leader
	IncludeDepartments []string `json:"includeDepartments" db:"include_departments"` //TODO возможно это нужно делать в другом месте
	DefaultFilters     string   // TODO определиться с типом и форматом фильтров (возможно фильтры нужно делать в другом месте)
	MattermostId       string   `json:"mattermostId" db:"most_id"` //TODO возможно на клиенте это мне не нужно будет
	//TODO нужно как-то связывать работника и пользователя (чтобы пользователь мог вернуть инструмент) можно сгенерировать какой-нибудь код, записать его в keycloak и бд, а потом по нему искать запись
}

type WriteEmployeeDTO struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	DepartmentId string `json:"departmentId"`
	MattermostId string `json:"mattermostId"`
}
