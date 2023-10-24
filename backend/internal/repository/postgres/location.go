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

type LocationRepo struct {
	db *sqlx.DB
}

func NewLocationRepo(db *sqlx.DB) *LocationRepo {
	return &LocationRepo{
		db: db,
	}
}

type Location interface {
	GetLast(context.Context, string) (*models.Location, error)
	Create(context.Context, models.CreateLocationDTO) error
	Update(context.Context, models.UpdateLocationDTO) error
}

func (r *LocationRepo) GetLast(ctx context.Context, instrumentId string) (*models.Location, error) {
	query := fmt.Sprintf(`SELECT id, instrument_id, receipt_date, delivery_date, status, person, department
		FROM %s WHERE instrument_id=$1 ORDER BY receipt_date LIMIT 1`,
		SIMovementTable,
	)
	location := &models.Location{}

	if err := r.db.Get(location, query, instrumentId); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	return location, nil
}

func (r *LocationRepo) Create(ctx context.Context, l models.CreateLocationDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, receipt_date, delivery_date, status, person, department)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		SIMovementTable,
	)
	id := uuid.New()

	_, err := r.db.Exec(query, id, l.InstrumentId, l.ReceiptDate, l.DeliveryDate, l.Status, l.Person, l.Department)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *LocationRepo) Update(ctx context.Context, l models.UpdateLocationDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET receipt_date=$1, delivery_date=$2, status=$3, person=$4, department=$5 WHERE id=$6`,
		SIMovementTable,
	)

	_, err := r.db.Exec(query, l.ReceiptDate, l.DeliveryDate, l.Status, l.Person, l.Department, l.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
