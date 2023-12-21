package postgres

import (
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"golang.org/x/net/context"
)

type EmployeeRepo struct {
	db *sqlx.DB
}

func NewEmployeeRepo(db *sqlx.DB) *EmployeeRepo {
	return &EmployeeRepo{
		db: db,
	}
}

type Employee interface {
	GetByDepartment(context.Context, string) ([]models.Employee, error)
	Create(context.Context, models.WriteEmployeeDTO) error
	Update(context.Context, models.WriteEmployeeDTO) error
	Delete(context.Context, string) error
}

func (r *EmployeeRepo) GetByDepartment(ctx context.Context, departmentId string) (employees []models.Employee, err error) {
	query := fmt.Sprintf(`SELECT id, name, most_id FROM %s WHERE department_id=$1`, EmployeeTable)

	if err := r.db.Select(&employees, query, departmentId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return employees, nil
}

func (r *EmployeeRepo) Create(ctx context.Context, employee models.WriteEmployeeDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, name, department_id, most_id) VALUES ($1, $2, $3, $4)`, EmployeeTable)
	id := uuid.New()

	_, err := r.db.Exec(query, id, employee.Name, employee.DepartmentId, employee.MattermostId)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *EmployeeRepo) Update(ctx context.Context, employee models.WriteEmployeeDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET name=$1, department_id=$2, most_id=$3 WHERE id=$4`, EmployeeTable)

	_, err := r.db.Exec(query, employee.Name, employee.DepartmentId, employee.MattermostId, employee.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *EmployeeRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf("DELETE FROM %s WHERE id=$1", EmployeeTable)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
