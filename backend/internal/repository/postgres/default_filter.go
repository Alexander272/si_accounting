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
	Get(context.Context, string) ([]models.DefaultFilter, error)
}

func (r *DefaultFilterRepo) Get(ctx context.Context, ssoId string) (filters []models.DefaultFilter, err error) {
	query := fmt.Sprintf(`SELECT id, filter_name, compare_type, value FROM %s WHERE sso_id=$1`, DefaultFilterTable)

	if err := r.db.Select(&filters, query, ssoId); err != nil {
		return nil, fmt.Errorf("failed execute query. error: %w", err)
	}
	return filters, nil
}
