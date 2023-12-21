package models

type Role struct {
	Id   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	//TODO menu
}

type RoleFull struct {
	Id      string  `json:"id" db:"id"`
	Name    string  `json:"name" db:"name"`
	Number  int     `json:"number" db:"number"`
	Extends *string `json:"extends" db:"extends"`
	//TODO menu
}

type RoleWithApi struct{}

type GetRolesDTO struct{}

type RoleDTO struct {
	Id      string  `json:"id" db:"id"`
	Name    string  `json:"name" db:"name" binding:"required"`
	Number  int     `json:"number" db:"number" binding:"required"`
	Extends *string `json:"extends" db:"extends"`
}
