package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"time"

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
	Create(context.Context, models.CreateVerificationDTO) (string, error)
	Update(context.Context, models.UpdateVerificationDTO) error
}

// func (r *VerificationRepo) GetById(ctx context.Context, id string) ([]models.Verification, error) {
// query :=
// }

func (r *VerificationRepo) GetLast(ctx context.Context, instrumentId string) (*models.Verification, error) {
	query := fmt.Sprintf(`SELECT id, instrument_id, date, next_date, file_link, register_link, status, notes FROM %s
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

	date, err := strconv.ParseInt(verification.Date, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse date. error: %w", err)
	}
	verification.Date = time.Unix(date, 0).Format("02.01.2006")

	nextDate, err := strconv.ParseInt(verification.NextDate, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse date. error: %w", err)
	}
	if nextDate > 0 {
		verification.NextDate = time.Unix(nextDate, 0).Format("02.01.2006")
	}

	return verification, nil
}

func (r *VerificationRepo) GetByInstrumentId(ctx context.Context, instrumentId string) (verifications []models.Verification, err error) {
	query := fmt.Sprintf(`SELECT id, instrument_id, register_link, status, date, next_date, notes FROM %s
	 	WHERE instrument_id=$1 ORDER BY created_at, id`,
		VerificationTable,
	)
	// TODO мне еще нужны файлы (документы)

	if err := r.db.Select(&verifications, query, instrumentId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return verifications, nil
}

func (r *VerificationRepo) Create(ctx context.Context, v models.CreateVerificationDTO) (string, error) {
	query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date, next_date, file_link, register_link, status, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		VerificationTable,
	)
	id := uuid.New()

	date, err := time.Parse("02.01.2006", v.Date)
	if err != nil {
		return "", fmt.Errorf("failed to parse date. error: %w", err)
	}
	nextDate := time.Unix(0, 0)
	if v.NextDate != "" {
		nextDate, err = time.Parse("02.01.2006", v.NextDate)
		if err != nil {
			return "", fmt.Errorf("failed to parse date. error: %w", err)
		}
	}

	_, err = r.db.Exec(query, id, v.InstrumentId, date.Unix(), nextDate.Unix(), v.FileLink, v.RegisterLink, v.Status, v.Notes)
	if err != nil {
		return "", fmt.Errorf("failed to execute query. error: %w", err)
	}
	return id.String(), nil
}

func (r *VerificationRepo) Update(ctx context.Context, v models.UpdateVerificationDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET date=$1, file_link=$2, register_link=$3, status=$4, next_date=$5, notes=$6 WHERE id=$7`,
		VerificationTable,
	)

	date, err := time.Parse("02.01.2006", v.Date)
	if err != nil {
		return fmt.Errorf("failed to parse date. error: %w", err)
	}
	nextDate := time.Unix(0, 0)
	if v.NextDate != "" {
		nextDate, err = time.Parse("02.01.2006", v.NextDate)
		if err != nil {
			return fmt.Errorf("failed to parse date. error: %w", err)
		}
	}

	_, err = r.db.Exec(query, date.Unix(), v.FileLink, v.RegisterLink, v.Status, nextDate.Unix(), v.Notes, v.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
