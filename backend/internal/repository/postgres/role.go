package postgres

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type RoleRepo struct {
	db *sqlx.DB
}

func NewRoleRepo(db *sqlx.DB) *RoleRepo {
	return &RoleRepo{
		db: db,
	}
}

type Role interface {
	GetAll(context.Context, models.GetRolesDTO) ([]models.RoleFull, error)
	Create(context.Context, models.RoleDTO) error
	Update(context.Context, models.RoleDTO) error
	Delete(context.Context, string) error
}

func (r *RoleRepo) GetAll(ctx context.Context, req models.GetRolesDTO) (roles []models.RoleFull, err error) {
	query := fmt.Sprintf(`SELECT id, name, number, extends FROM %s`, RoleTable)

	if err := r.db.Select(&roles, query); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return roles, nil
}

func (r *RoleRepo) Create(ctx context.Context, role models.RoleDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, name, number, extends) VALUES ($1, $2, $3, $4)`, RoleTable)
	id := uuid.New()

	_, err := r.db.Exec(query, id, role.Name, role.Number, role.Extends)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *RoleRepo) Update(ctx context.Context, role models.RoleDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET name=$1, number=$2, extends=$3 WHERE id=$4`, RoleTable)

	_, err := r.db.Exec(query, role.Name, role.Number, role.Extends, role.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *RoleRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=$1`, RoleTable)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
