package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/google/uuid"
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
	Get(context.Context, string) ([]*models.SIFilter, error)
	Create(context.Context, *models.FilterDTO) error
	CreateSeveral(context.Context, []*models.FilterDTO) error
	Update(context.Context, *models.FilterDTO) error
	Delete(context.Context, *models.DeleteFilterDTO) error
	DeleteBySSOId(context.Context, string) error
}

func (r *DefaultFilterRepo) Get(ctx context.Context, ssoId string) (filters []*models.SIFilter, err error) {
	var data []*models.DefaultFilter
	query := fmt.Sprintf(`SELECT id, filter_name, compare_type, value FROM %s WHERE sso_id=$1`, DefaultFilterTable)

	if err := r.db.Select(&data, query, ssoId); err != nil {
		return nil, fmt.Errorf("failed execute query. error: %w", err)
	}

	for i, f := range data {
		value := &models.SIFilterValue{
			CompareType: f.CompareType,
			Value:       f.Value,
		}

		if i == 0 || f.FilterName != filters[len(filters)-1].Field {
			filters = append(filters, &models.SIFilter{
				Field:     f.FilterName,
				FieldType: "",
				Values:    []*models.SIFilterValue{value},
			})
		} else {
			filters[len(filters)-1].Values = append(filters[len(filters)-1].Values, value)
		}
	}

	return filters, nil
}

func (r *DefaultFilterRepo) Create(ctx context.Context, dto *models.FilterDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, sso_id, filter_name, compare_type, value) VALUES (:id, :sso_id, :filter_name, :compare_type, :value)`,
		DefaultFilterTable,
	)
	dto.Id = uuid.NewString()

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *DefaultFilterRepo) CreateSeveral(ctx context.Context, dto []*models.FilterDTO) error {
	values := []string{}
	args := []interface{}{}
	c := 5
	for i, v := range dto {
		id := uuid.New()
		args = append(args, id, v.SSOId, v.FilterName, v.CompareType, v.Value)
		values = append(values, fmt.Sprintf("($%d, $%d, $%d, $%d, $%d)", c*i+1, c*i+2, c*i+3, c*i+4, c*i+5))
	}
	query := fmt.Sprintf(`INSERT INTO %s (id, sso_id, filter_name, compare_type, value) VALUES %s`, DefaultFilterTable, strings.Join(values, ","))

	if _, err := r.db.ExecContext(ctx, query, args...); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *DefaultFilterRepo) Update(ctx context.Context, dto *models.FilterDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET compare_type=:compare_type, value=:value WHERE id=:id`, DefaultFilterTable)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *DefaultFilterRepo) Delete(ctx context.Context, dto *models.DeleteFilterDTO) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=:id`, DefaultFilterTable)

	if _, err := r.db.NamedExecContext(ctx, query, dto); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *DefaultFilterRepo) DeleteBySSOId(ctx context.Context, ssoId string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE sso_id=$1`, DefaultFilterTable)

	if _, err := r.db.ExecContext(ctx, query, ssoId); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
