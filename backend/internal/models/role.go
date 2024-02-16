package models

import "github.com/lib/pq"

type Role struct {
	Id   string   `json:"id" db:"id"`
	Name string   `json:"name" db:"name"`
	Menu []string `json:"menu"`
}
type RoleWithMenuDTO struct {
	Id      string         `json:"id" db:"id"`
	Name    string         `json:"name" db:"name"`
	Extends pq.StringArray `db:"extends"`
	Menu    string         `db:"menu"`
}

type RoleFull struct {
	Id          string   `json:"id" db:"id"`
	Name        string   `json:"name" db:"name"`
	Number      int      `json:"number" db:"number"`
	Extends     []string `json:"extends" db:"extends"`
	Description string   `json:"description" db:"description"`
	//TODO menu
}
type RoleFullDTO struct {
	Id          string         `json:"id" db:"id"`
	Name        string         `json:"name" db:"name"`
	Number      int            `json:"number" db:"number"`
	Extends     pq.StringArray `json:"extends" db:"extends"`
	Description string         `json:"description" db:"description"`
}

type RoleWithApi struct{}

type GetRolesDTO struct{}

type RoleDTO struct {
	Id          string   `json:"id" db:"id"`
	Name        string   `json:"name" db:"name" binding:"required"`
	Number      int      `json:"number" db:"number" binding:"required"`
	Extends     []string `json:"extends" db:"extends"`
	Description string   `json:"description" db:"description"`
}
