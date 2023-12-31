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
	/*
		Если extends сделать массивом то нужен такой запрос
		//надо выяснить как casbin будет реагировать на то, что одна роль наследуется от двух других (все норм)
		@return массив с наименованиями ролей от которых наследуется текущая

		SELECT m.id, role_id, name, number, menu_item_id, CASE WHEN extends IS NOT NULL THEN
			ARRAY(SELECT name FROM roles_test WHERE ARRAY[id] <@ r.extends) ELSE '{}' END AS extends
			FROM menu_by_role AS m INNER JOIN roles_test AS r ON role_id=r.id ORDER BY number, name
	*/
	query := fmt.Sprintf(`SELECT m.id, role_id, name, number, menu_item_id, CASE WHEN extends IS NOT NULL THEN
		(SELECT name FROM %s WHERE id=r.extends) ELSE '' END AS extends
		FROM %s AS m INNER JOIN %s AS r ON role_id=r.id ORDER BY number, name`,
		RoleTable, MenuByRoleTable, RoleTable,
	)

	if err := r.db.Select(&menu, query); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
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
