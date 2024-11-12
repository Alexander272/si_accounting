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

type DepartmentRepo struct {
	db *sqlx.DB
}

func NewDepartmentRepo(db *sqlx.DB) *DepartmentRepo {
	return &DepartmentRepo{
		db: db,
	}
}

type Department interface {
	GetAll(context.Context) ([]*models.Department, error)
	GetById(context.Context, string) (*models.Department, error)
	GetBySSOId(context.Context, string) ([]*models.Department, error)
	Create(context.Context, *models.Department) (string, error)
	Update(context.Context, *models.Department) error
	Delete(context.Context, string) error
}

func (r *DepartmentRepo) GetAll(ctx context.Context) ([]*models.Department, error) {
	query := fmt.Sprintf(`SELECT id, name FROM %s ORDER BY name`, DepartmentTable)
	departments := []*models.Department{}

	if err := r.db.Select(&departments, query); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return departments, nil
}

func (r *DepartmentRepo) GetById(ctx context.Context, id string) (*models.Department, error) {
	query := fmt.Sprintf(`SELECT d.id, d.name, COALESCE(d.leader_id::text, '') AS leader_id, COALESCE(d.channel_id::text, '') AS channel_id, 
		COALESCE(c.name, '') AS channel_name FROM %s AS d LEFT JOIN %s AS c ON d.channel_id=c.id WHERE d.id=$1 `,
		DepartmentTable, ChannelTable,
	)
	data := &models.Department{}

	if err := r.db.Get(data, query, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *DepartmentRepo) GetBySSOId(ctx context.Context, id string) ([]*models.Department, error) {
	query := fmt.Sprintf(`SELECT d.id, d.name FROM %s AS d INNER JOIN %s AS e ON e.department_id=d.id WHERE e.is_lead=true AND sso_id=$1`,
		DepartmentTable, EmployeeTable,
	)
	data := []*models.Department{}

	if err := r.db.Select(&data, query, id); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return data, nil
}

func (r *DepartmentRepo) Create(ctx context.Context, department *models.Department) (string, error) {
	query := fmt.Sprintf(`INSERT INTO %s(id, name, leader_id, channel_id) VALUES ($1, $2, $3, $4)`, DepartmentTable)
	department.Id = uuid.NewString()

	_, err := r.db.Exec(query, department.Id, department.Name, department.LeaderId, department.ChannelId)
	if err != nil {
		return "", fmt.Errorf("failed to execute query. error: %w", err)
	}
	return department.Id, nil
}

func (r *DepartmentRepo) Update(ctx context.Context, department *models.Department) error {
	query := fmt.Sprintf(`UPDATE %s SET name=$1, leader_id=$2, channel_id=$3 WHERE id=$4`, DepartmentTable)

	var leaderId *string = &department.LeaderId
	if department.LeaderId == "" {
		leaderId = nil
	}
	var channelId *string = &department.ChannelId
	if department.ChannelId == "" {
		channelId = nil
	}

	_, err := r.db.Exec(query, department.Name, leaderId, channelId, department.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *DepartmentRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=$1`, DepartmentTable)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
