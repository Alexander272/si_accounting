package postgres

import (
	"github.com/jmoiron/sqlx"
)

type InstrumentRepo struct {
	db *sqlx.DB
}

func NewInstrumentRepo(db *sqlx.DB) *InstrumentRepo {
	return &InstrumentRepo{
		db: db,
	}
}

type Instrument interface{}

// func (r *InstrumentRepo) GetAll(ctx context.Context, )
