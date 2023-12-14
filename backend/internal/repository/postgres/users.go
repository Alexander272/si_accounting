package postgres

import (
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"golang.org/x/net/context"
)

type UserRepo struct {
	db *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) *UserRepo {
	return &UserRepo{
		db: db,
	}
}

type User interface {
	GetByDepartment(context.Context, string) ([]models.User, error)
	Create(context.Context, models.WriteUserDTO) error
	Update(context.Context, models.WriteUserDTO) error
	Delete(context.Context, string) error
}

func (r *UserRepo) GetByDepartment(ctx context.Context, departmentId string) (users []models.User, err error) {
	query := fmt.Sprintf(`SELECT id, name, most_id FROM %s WHERE department_id=$1`, UserTable)

	if err := r.db.Select(&users, query, departmentId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return users, nil
}

func (r *UserRepo) Create(ctx context.Context, user models.WriteUserDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, name, department_id, most_id) VALUES ($1, $2, $3, $4)`, UserTable)
	id := uuid.New()

	_, err := r.db.Exec(query, id, user.Name, user.DepartmentId, user.MattermostId)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *UserRepo) Update(ctx context.Context, user models.WriteUserDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET name=$1, department_id=$2, most_id=$3 WHERE id=$4`, UserTable)

	_, err := r.db.Exec(query, user.Name, user.DepartmentId, user.MattermostId, user.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *UserRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf("DELETE FROM %s WHERE id=$1", UserTable)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
