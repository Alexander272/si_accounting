package repository

import (
	"github.com/Alexander272/si_accounting/backend/internal/repository/postgres"
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
type DefaultFilter interface {
	postgres.DefaultFilter
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
	DefaultFilter
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Instrument:    postgres.NewInstrumentRepo(db),
		Verification:  postgres.NewVerificationRepo(db),
		Documents:     postgres.NewDocumentsRepo(db),
		Location:      postgres.NewLocationRepo(db),
		SI:            postgres.NewSIRepo(db),
		Department:    postgres.NewDepartmentRepo(db),
		Employee:      postgres.NewEmployeeRepo(db),
		Role:          postgres.NewRoleRepo(db),
		ApiPaths:      postgres.NewApiRepo(db),
		MenuItem:      postgres.NewMenuItemRepo(db),
		MenuWithApi:   postgres.NewMenuWithApiRepo(db),
		Menu:          postgres.NewMenuRepo(db),
		DefaultFilter: postgres.NewDefaultFilterRepo(db),
	}
}
