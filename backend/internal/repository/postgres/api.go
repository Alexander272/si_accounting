package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type ApiRepo struct {
	db *sqlx.DB
}

func NewApiRepo(db *sqlx.DB) *ApiRepo {
	return &ApiRepo{
		db: db,
	}
}

type Api interface {
	GetAll(context.Context) ([]models.Api, error)
	Create(context.Context, models.ApiDTO) error
	CreateSeveral(context.Context, []models.ApiDTO) error
	Update(context.Context, models.ApiDTO) error
	Delete(context.Context, string) error
}

func (r *ApiRepo) GetAll(ctx context.Context) (api []models.Api, err error) {
	query := fmt.Sprintf(`SELECT id, path, method, description FROM %s ORDER BY path`, ApiTable)

	if err := r.db.Select(&api, query); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return api, nil
}

func (r *ApiRepo) Create(ctx context.Context, api models.ApiDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, path, method, description) VALUES ($1, $2, $3, $4)`, ApiTable)
	id := uuid.New()

	_, err := r.db.Exec(query, id, api.Path, api.Method, api.Description)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ApiRepo) CreateSeveral(ctx context.Context, api []models.ApiDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, path, method, description) VALUES `, ApiTable)

	c := 4
	args := make([]interface{}, 0, c*len(api))
	values := make([]string, 0, len(api))

	for i, ad := range api {
		id := uuid.New()
		values = append(values, fmt.Sprintf("($%d, $%d, $%d, $%d)", c*i+1, c*i+2, c*i+3, c*i+4))
		args = append(args, id, ad.Path, ad.Method, ad.Description)
	}
	query += strings.Join(values, ", ")

	_, err := r.db.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ApiRepo) Update(ctx context.Context, api models.ApiDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET path=$1, method=$2, description=$3 WHERE id=$4`, ApiTable)

	_, err := r.db.Exec(query, api.Path, api.Method, api.Description)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *ApiRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=$1`, ApiTable)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

// func (r *ApiRepo) DeleteAll(ctx context.Context) error {}
