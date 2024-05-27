package postgres

import (
	"context"
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
	GetAll(context.Context) ([]models.Department, error)
	Create(context.Context, models.Department) error
	Update(context.Context, models.Department) error
	Delete(context.Context, string) error
}

func (r *DepartmentRepo) GetAll(ctx context.Context) (departments []models.Department, err error) {
	//TODO возможно нужно забирать данные о начальнике из таблицы users
	query := fmt.Sprintf(`SELECT id, name FROM %s`, DepartmentTable)

	if err := r.db.Select(&departments, query); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return departments, nil
}

func (r *DepartmentRepo) Create(ctx context.Context, department models.Department) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, name) VALUES ($1, $2)`, DepartmentTable)
	id := uuid.New()

	_, err := r.db.Exec(query, id, department.Name)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *DepartmentRepo) Update(ctx context.Context, department models.Department) error {
	query := fmt.Sprintf(`UPDATE %s SET name=$1 WHERE id=$3`, DepartmentTable)

	_, err := r.db.Exec(query, department.Name, department.Id)
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
