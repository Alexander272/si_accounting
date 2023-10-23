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

type Repository struct {
	Instrument
	Verification
}

func NewRepository(db *sqlx.DB, redis redis.Cmdable) *Repository {
	return &Repository{
		Instrument:   postgres.NewInstrumentRepo(db),
		Verification: postgres.NewVerificationRepo(db),
	}
}
