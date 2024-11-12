package models

type Responsible struct {
	Id           string `json:"id" db:"id"`
	DepartmentId string `json:"departmentId" db:"department_id"`
	SSOId        string `json:"ssoId" db:"sso_id"`
}

type ResponsibleDTO struct {
	Id           string `json:"id" db:"id"`
	DepartmentId string `json:"departmentId" db:"department_id"`
	SSOId        string `json:"ssoId" db:"sso_id"`
}

type GetResponsibleDTO struct {
	DepartmentId string `json:"departmentId" db:"department_id"`
	SSOId        string `json:"ssoId" db:"sso_id"`
}

type ChangeResponsibleDTO struct {
	New     []*ResponsibleDTO `json:"new"`
	Updated []*ResponsibleDTO `json:"updated"`
	Deleted []string          `json:"deleted"`
}
