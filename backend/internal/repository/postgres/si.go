package postgres

import (
	"context"
	"fmt"
	"strconv"
	"time"

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
	GetAll(ctx context.Context, req models.SIParams) ([]models.SI, int, error)
}

func (r *SIRepo) GetAll(ctx context.Context, req models.SIParams) ([]models.SI, int, error) {
	order := ""
	if req.Sort.Field != "" {
		order = fmt.Sprintf(" ORDER BY %s %s", req.Sort.Field, req.Sort.Type)
	}

	filter := ""
	params := []interface{}{}
	count := 1

	switch req.Filter.CompareType {
	case "contains":
		filter = fmt.Sprintf("AND LOWER(%s) LIKE LOWER('%%'||$1||'%%')", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "start":
		filter = fmt.Sprintf("AND LOWER(%s) LIKE LOWER($1||'%%')", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "end":
		filter = fmt.Sprintf("AND LOWER(%s) LIKE LOWER('%%'||$1)", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "equals":
		filter = fmt.Sprintf("AND LOWER(%s)=LOWER($1)", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "more":
		filter = fmt.Sprintf("AND %s>$1", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "less":
		filter = fmt.Sprintf("AND %s<$1", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "period":
		filter = fmt.Sprintf("AND %s>$1 AND %s<$2", req.Filter.Field, req.Filter.Field)
		params = append(params, req.Filter.Values[0], req.Filter.Values[1])
		count += 2
	}

	params = append(params, req.Page.Limit, req.Page.Offset)

	var total struct {
		Total int `db:"total"`
	}
	totalQuery := fmt.Sprintf(`SELECT count(name) AS total FROM %s AS i
		LEFT JOIN LATERAL (SELECT date, next_date FROM %s WHERE instrument_id=i.id ORDER BY date LIMIT 1) AS v ON TRUE
		WHERE i.status='%s' %s`,
		InstrumentTable, VerificationTable, constants.InstrumentStatusWork, filter,
	)

	if err := r.db.Get(&total, totalQuery, params[:count-1]...); err != nil {
		return nil, 0, fmt.Errorf("failed to execute total query. error: %w", err)
	}

	query := fmt.Sprintf(`SELECT id, name, type, factory_number, measurement_limits, accuracy, state_register, manufacturer, year_of_issue, 
		inter_verification_interval, notes, i.status, v.date, v.next_date, m.place
		FROM %s AS i
		LEFT JOIN LATERAL (SELECT date, next_date FROM %s WHERE instrument_id=i.id ORDER BY date DESC LIMIT 1) AS v ON TRUE
		LEFT JOIN LATERAL (SELECT (CASE WHEN status='%s' THEN department WHEN status='%s' THEN 'Резерв' ELSE 'Перемещение' END) as place 
			FROM %s WHERE instrument_id=i.id ORDER BY receipt_date LIMIT 1) as m ON TRUE
		WHERE i.status='%s' %s %s LIMIT $%d OFFSET $%d`,
		InstrumentTable, VerificationTable, constants.LocationStatusUsed, constants.LocationStatusReserve, SIMovementTable, constants.InstrumentStatusWork,
		filter, order, count, count+1,
	)
	si := []models.SI{}

	if err := r.db.Select(&si, query, params...); err != nil {
		return nil, 0, fmt.Errorf("failed to execute query. error: %w", err)
	}

	for i, s := range si {
		date, err := strconv.ParseInt(s.Date, 10, 64)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to parse date. error: %w", err)
		}
		si[i].Date = time.Unix(date, 0).Format("02.01.2006")

		nextDate, err := strconv.ParseInt(s.NextDate, 10, 64)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to parse date. error: %w", err)
		}
		if nextDate > 0 {
			si[i].NextDate = time.Unix(nextDate, 0).Format("02.01.2006")
		}
	}

	return si, total.Total, nil
}
