package repository

import (
	"github.com/Alexander272/si_accounting/backend/internal/repository/postgres"
	"github.com/go-redis/redis/v8"
	"github.com/jmoiron/sqlx"
)

type Instrument interface {
	postgres.Instrument
}
type Verification interface {
	postgres.Verification
}
type Documents interface {
	postgres.Documents
}
type Location interface {
	postgres.Location
}
type SI interface {
	postgres.SI
}
type Department interface {
	postgres.Department
}
type Employee interface {
	postgres.Employee
}

type Role interface {
	postgres.Role
}
type ApiPaths interface {
	postgres.Api
}
type MenuItem interface {
	postgres.MenuItem
}
type MenuWithApi interface {
	postgres.MenuWithApi
}
type Menu interface {
	postgres.Menu
}

type Repository struct {
	Instrument
	Verification
	Documents
	Location
	SI
	Department
	Employee
	Role
	ApiPaths
	MenuItem
	MenuWithApi
	Menu
}

func NewRepository(db *sqlx.DB, redis redis.Cmdable) *Repository {
	return &Repository{
		Instrument:   postgres.NewInstrumentRepo(db),
		Verification: postgres.NewVerificationRepo(db),
		Documents:    postgres.NewDocumentsRepo(db),
		Location:     postgres.NewLocationRepo(db),
		SI:           postgres.NewSIRepo(db),
		Department:   postgres.NewDepartmentRepo(db),
		Employee:     postgres.NewEmployeeRepo(db),
		Role:         postgres.NewRoleRepo(db),
		ApiPaths:     postgres.NewApiRepo(db),
		MenuItem:     postgres.NewMenuItemRepo(db),
		MenuWithApi:  postgres.NewMenuWithApiRepo(db),
		Menu:         postgres.NewMenuRepo(db),
	}
}
