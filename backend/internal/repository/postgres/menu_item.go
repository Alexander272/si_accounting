package postgres

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type MenuItemRepo struct {
	db *sqlx.DB
}

func NewMenuItemRepo(db *sqlx.DB) *MenuItemRepo {
	return &MenuItemRepo{
		db: db,
	}
}

type MenuItem interface {
	GetAll(context.Context) ([]models.MenuItem, error)
	Create(context.Context, models.MenuItemDTO) error
	Update(context.Context, models.MenuItemDTO) error
	Delete(context.Context, string) error
}

func (r *MenuItemRepo) GetAll(ctx context.Context) (menu []models.MenuItem, err error) {
	query := fmt.Sprintf(`SELECT m.id, i.name, menu_item_id, i.description, i.is_show, api_id, method, path, a.description AS api_description
		FROM %s AS m INNER JOIN %s AS i ON menu_item_id=i.id INNER JOIN %s AS a ON api_id=a.id ORDER BY menu_item_id`,
		MenuWithApiTable, MenuItemTable, ApiTable,
	)
	var dto []models.MenuItemWithApi

	if err := r.db.Select(&dto, query); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	for i, m := range dto {
		api := models.Api{
			Id:          m.ApiId,
			Method:      m.Method,
			Path:        m.Path,
			Description: m.ApiDescription,
		}

		if i == 0 || menu[len(menu)-1].Id == m.MenuId {
			menu = append(menu, models.MenuItem{
				Id:          m.MenuId,
				Name:        m.Name,
				Description: m.Description,
				IsShow:      m.IsShow,
				Api:         []models.Api{api},
			})
		} else {
			menu[len(menu)-1].Api = append(menu[len(menu)-1].Api, api)
		}
	}

	return menu, nil
}

func (r *MenuItemRepo) Create(ctx context.Context, menu models.MenuItemDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, name, description, is_show) VALUES ($1, $2, $3, $4)`, MenuItemTable)
	id := uuid.New()

	_, err := r.db.Exec(query, id, menu.Name, menu.Description, menu.IsShow)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *MenuItemRepo) Update(ctx context.Context, menu models.MenuItemDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET name=$1, description=$2, is_show=$3 WHERE id=$4`, MenuItemTable)

	_, err := r.db.Exec(query, menu.Name, menu.Description, menu.IsShow, menu.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *MenuItemRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=$1`, MenuItemTable)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
