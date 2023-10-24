package postgres

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type SIRepo struct {
	db *sqlx.DB
}

func NewSIRepo(db *sqlx.DB) *SIRepo {
	return &SIRepo{
		db: db,
	}
}

type SI interface {
	GetAll(ctx context.Context, req models.SIParams) ([]models.SI, error)
}

/*
? Получение списка СИ

SELECT id, name, type, factory_number, measurement_limits, accuracy, state_register, manufacturer, year_of_issue,
	inter_verification_interval, notes, i.status, v.date, v.next_date, m.place
	FROM public.instruments AS i
	LEFT JOIN LATERAL (SELECT date, next_date FROM public.verification_history WHERE instrument_id=i.id ORDER BY date LIMIT 1) AS v ON TRUE
	LEFT JOIN LATERAL (SELECT (CASE WHEN status='used' THEN department WHEN status='reserve' THEN 'Резерв' ELSE 'Перемещение' END) as place
					   FROM si_movement_history WHERE instrument_id=i.id ORDER BY receipt_date LIMIT 1) as m ON TRUE
	WHERE i.status='work'
*/

func (r *SIRepo) GetAll(ctx context.Context, req models.SIParams) ([]models.SI, error) {
	query := fmt.Sprintf(`SELECT id, name, type, factory_number, measurement_limits, accuracy, state_register, manufacturer, year_of_issue, 
		inter_verification_interval, notes, i.status, v.date, v.next_date, m.place
		FROM %s AS i
		LEFT JOIN LATERAL (SELECT date, next_date FROM %s WHERE instrument_id=i.id ORDER BY date LIMIT 1) AS v ON TRUE
		LEFT JOIN LATERAL (SELECT (CASE WHEN status='%s' THEN department WHEN status='%s' THEN 'Резерв' ELSE 'Перемещение' END) as place 
			FROM %s WHERE instrument_id=i.id ORDER BY receipt_date LIMIT 1) as m ON TRUE
		WHERE i.status='%s'`,
		InstrumentTable, VerificationTable, constants.LocationStatusUsed, constants.LocationStatusReserve, SIMovementTable, constants.InstrumentStatusWork,
	)
	si := []models.SI{}

	if err := r.db.Select(&si, query); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return si, nil
}
