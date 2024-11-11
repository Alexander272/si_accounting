package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type ResponsibleRepo struct {
	db *sqlx.DB
}

func NewResponsibleRepo(db *sqlx.DB) *ResponsibleRepo {
	return &ResponsibleRepo{
		db: db,
	}
}

type Responsible interface {
	Get(ctx context.Context, req *models.GetResponsibleDTO) ([]*models.Responsible, error)
	GetBySSOId(ctx context.Context, id string) ([]*models.Responsible, error)
	Create(ctx context.Context, dto *models.ResponsibleDTO) error
	CreateSeveral(ctx context.Context, dto []*models.ResponsibleDTO) error
	Update(ctx context.Context, dto *models.ResponsibleDTO) error
	UpdateSeveral(ctx context.Context, dto []*models.ResponsibleDTO) error
	Delete(ctx context.Context, id string) error
	DeleteSeveral(ctx context.Context, ids []string) error
}

func (r *ResponsibleRepo) Get(ctx context.Context, req *models.GetResponsibleDTO) ([]*models.Responsible, error) {
	condition := ""
	params := []interface{}{}
	if req.DepartmentId != "" {
		condition = "WHERE department_id=$1"
		params = append(params, req.DepartmentId)
	}
	query := fmt.Sprintf(`SELECT id, department_id, sso_id FROM %s %s ORDER BY created_at, id`, ResponsibleTable, condition)
	data := []*models.Responsible{}

	if err := r.db.SelectContext(ctx, &data, query, params...); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *ResponsibleRepo) GetBySSOId(ctx context.Context, id string) ([]*models.Responsible, error) {
	query := fmt.Sprintf(`SELECT id, department_id, sso_id FROM %s WHERE sso_id=$1`, ResponsibleTable)
	data := []*models.Responsible{}

	if err := r.db.SelectContext(ctx, &data, query, id); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *ResponsibleRepo) Create(ctx context.Context, dto *models.ResponsibleDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s (id, department_id, sso_id) VALUES ($1, $2, $3)`, ResponsibleTable)
	id := uuid.New()

	_, err := r.db.ExecContext(ctx, query, id, dto.DepartmentId, dto.SSOId)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ResponsibleRepo) CreateSeveral(ctx context.Context, dto []*models.ResponsibleDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, department_id, sso_id) VALUES `, ResponsibleTable)

	args := make([]interface{}, 0)
	values := make([]string, 0, len(dto))
	c := 3
	for i, d := range dto {
		id := uuid.New()
		args = append(args, id, d.DepartmentId, d.SSOId)
		values = append(values, fmt.Sprintf("($%d, $%d, $%d)", i*c+1, i*c+2, i*c+3))
	}
	query += strings.Join(values, ",")

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ResponsibleRepo) Update(ctx context.Context, dto *models.ResponsibleDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET department_id=$1, sso_id=$2 WHERE id=$3`, ResponsibleTable)

	_, err := r.db.ExecContext(ctx, query, dto.DepartmentId, dto.SSOId, dto.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ResponsibleRepo) UpdateSeveral(ctx context.Context, dto []*models.ResponsibleDTO) error {
	values := []string{}
	args := []interface{}{}
	c := 3
	for i, v := range dto {
		args = append(args, v.DepartmentId, v.SSOId, v.Id)
		values = append(values, fmt.Sprintf("($%d, $%d::uuid, $%d)", i*c+1, i*c+2, i*c+3))
	}

	query := fmt.Sprintf(`UPDATE %s AS t SET department_id=s.department_id, sso_id=s.sso_id FROM (VALUES %s) AS s(id, department_id, sso_id) 
		WHERE t.id=s.id::uuid`,
		ResponsibleTable, strings.Join(values, ","),
	)

	if _, err := r.db.ExecContext(ctx, query, args...); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ResponsibleRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=$1`, ResponsibleTable)

	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ResponsibleRepo) DeleteSeveral(ctx context.Context, ids []string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=ANY($1)`, ResponsibleTable)

	if _, err := r.db.ExecContext(ctx, query, pq.Array(ids)); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
