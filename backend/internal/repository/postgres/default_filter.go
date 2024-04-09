package postgres

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type DefaultFilterRepo struct {
	db *sqlx.DB
}

func NewDefaultFilterRepo(db *sqlx.DB) *DefaultFilterRepo {
	return &DefaultFilterRepo{
		db: db,
	}
}

type DefaultFilter interface {
	Get(context.Context, string) ([]models.SIFilter, error)
}

func (r *DefaultFilterRepo) Get(ctx context.Context, ssoId string) (filters []models.SIFilter, err error) {
	var data []models.DefaultFilter
	query := fmt.Sprintf(`SELECT id, filter_name, compare_type, value FROM %s WHERE sso_id=$1`, DefaultFilterTable)

	if err := r.db.Select(&data, query, ssoId); err != nil {
		return nil, fmt.Errorf("failed execute query. error: %w", err)
	}

	for i, f := range data {
		value := models.SIFilterValue{
			CompareType: f.CompareType,
			Value:       f.Value,
		}

		if i == 0 || f.FilterName != filters[len(filters)-1].Field {
			filters = append(filters, models.SIFilter{
				Field:     f.FilterName,
				FieldType: "",
				Values:    []models.SIFilterValue{value},
			})
		} else {
			filters[len(filters)-1].Values = append(filters[len(filters)-1].Values, value)
		}
	}

	return filters, nil
}
