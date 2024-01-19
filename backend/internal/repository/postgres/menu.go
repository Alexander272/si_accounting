package postgres

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type MenuRepo struct {
	db *sqlx.DB
}

func NewMenuRepo(db *sqlx.DB) *MenuRepo {
	return &MenuRepo{
		db: db,
	}
}

type Menu interface {
	GetAll(context.Context) ([]models.Menu, error)
	Create(context.Context, models.MenuDTO) error
	Update(context.Context, models.MenuDTO) error
	Delete(context.Context, string) error
}

func (r *MenuRepo) GetAll(ctx context.Context) (menu []models.Menu, err error) {
	var data []models.MenuPqDTO
	query := fmt.Sprintf(`SELECT m.id, role_id, name, number, menu_item_id, CASE WHEN extends IS NOT NULL THEN
		ARRAY(SELECT name FROM %s WHERE ARRAY[id] <@ r.extends) ELSE '{}' END AS extends
		FROM %s AS m INNER JOIN %s AS r ON role_id=r.id ORDER BY number, name`,
		RoleTable, MenuByRoleTable, RoleTable,
	)

	if err := r.db.Select(&data, query); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	for _, mpd := range data {
		menu = append(menu, models.Menu{
			Id:          mpd.Id,
			RoleId:      mpd.RoleId,
			RoleName:    mpd.RoleName,
			RoleNumber:  mpd.RoleNumber,
			RoleExtends: mpd.RoleExtends,
			MenuItemId:  mpd.MenuItemId,
		})
	}

	return menu, nil
}

func (r *MenuRepo) Create(ctx context.Context, menu models.MenuDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, role_id, menu_item_id) VALUES ($1, $2, $3)`, MenuByRoleTable)
	id := uuid.New()

	_, err := r.db.Exec(query, id, menu.RoleId, menu.MenuItemId)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *MenuRepo) Update(ctx context.Context, menu models.MenuDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET role_id=$1, menu_item_id=$2 WHERE id=$3`, MenuByRoleTable)

	_, err := r.db.Exec(query, menu.RoleId, menu.MenuItemId, menu.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *MenuRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=$1`, MenuByRoleTable)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
