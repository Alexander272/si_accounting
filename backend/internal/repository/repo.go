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
type Location interface {
	postgres.Location
}
type SI interface {
	postgres.SI
}

type Repository struct {
	Instrument
	Verification
	Location
	SI
}

func NewRepository(db *sqlx.DB, redis redis.Cmdable) *Repository {
	return &Repository{
		Instrument:   postgres.NewInstrumentRepo(db),
		Verification: postgres.NewVerificationRepo(db),
		Location:     postgres.NewLocationRepo(db),
		SI:           postgres.NewSIRepo(db),
	}
}
