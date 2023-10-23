package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type VerificationRepo struct {
	db *sqlx.DB
}

func NewVerificationRepo(db *sqlx.DB) *VerificationRepo {
	return &VerificationRepo{
		db: db,
	}
}

type Verification interface {
	GetLast(context.Context, string) (*models.Verification, error)
	Create(context.Context, models.CreateVerificationDTO) error
	Update(context.Context, models.UpdateVerificationDTO) error
}

// func (r *VerificationRepo) GetById(ctx context.Context, id string) ([]models.Verification, error) {
// query :=
// }

func (r *VerificationRepo) GetLast(ctx context.Context, instrumentId string) (*models.Verification, error) {
	query := fmt.Sprintf(`SELECT id, instrument_id, date, next_date, file_link, register_link, status FROM %s
		WHERE instrument_id=$1 ORDER BY date DESC LIMIT 1`,
		VerificationTable,
	)
	verification := &models.Verification{}

	if err := r.db.Get(verification, query, instrumentId); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	return verification, nil
}

func (r *VerificationRepo) Create(ctx context.Context, v models.CreateVerificationDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date, next_date, file_link, register_link, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		VerificationTable,
	)
	id := uuid.New()

	_, err := r.db.Exec(query, id, v.InstrumentId, v.Date, v.NextDate, v.FileLink, v.RegisterLink, v.Status)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *VerificationRepo) Update(ctx context.Context, v models.UpdateVerificationDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET date=$1, file_link=$2, register_link=$3, status=$4, next_date=$5 WHERE id=$6`,
		VerificationTable,
	)

	_, err := r.db.Exec(query, v.Date, v.FileLink, v.RegisterLink, v.Status, v.NextDate, v.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
