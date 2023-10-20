package repository

import (
	"github.com/Alexander272/si_accounting/backend/internal/repository/postgres"
	"github.com/go-redis/redis"
	"github.com/jmoiron/sqlx"
)

type Instrument interface {
	postgres.Instrument
}

type Repository struct {
	Instrument
}

func NewRepository(db *sqlx.DB, redis redis.Cmdable) *Repository {
	return &Repository{
		Instrument: postgres.NewInstrumentRepo(db),
	}
}
