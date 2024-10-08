package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type DocumentsRepo struct {
	db *sqlx.DB
}

func NewDocumentsRepo(db *sqlx.DB) *DocumentsRepo {
	return &DocumentsRepo{
		db: db,
	}
}

type Documents interface {
	Get(context.Context, *models.GetDocumentsDTO) ([]*models.Document, error)
	CreateSeveral(context.Context, []*models.Document) error
	UpdatePath(context.Context, *models.PathParts) (int64, error)
	DeleteById(context.Context, string) error
}

func (r *DocumentsRepo) Get(ctx context.Context, req *models.GetDocumentsDTO) ([]*models.Document, error) {
	query := fmt.Sprintf(`SELECT id, label, size, path, COALESCE(verification_id::text,'') AS verification_id, type FROM %s 
		WHERE verification_id::text=$1 OR (COALESCE(instrument_id::text,'')=$2 AND verification_id IS NULL)`,
		DocumentsTable,
	)
	docs := []*models.Document{}

	if err := r.db.Select(&docs, query, req.VerificationId, req.InstrumentId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return docs, nil
}

func (r *DocumentsRepo) CreateSeveral(ctx context.Context, docs []*models.Document) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, label, size, path, verification_id, type, instrument_id) VALUES `, DocumentsTable)

	args := make([]interface{}, 0)
	values := make([]string, 0, len(docs))

	for i, d := range docs {
		// id := uuid.New()

		var verificationId interface{} = nil
		if d.VerificationId != "" {
			verificationId = d.VerificationId
		}
		var instrumentId *string
		if d.InstrumentId != "" {
			instrumentId = &d.InstrumentId
		}

		temp := make([]interface{}, 0)
		temp = append(temp, d.Id, d.Label, d.Size, d.Path, verificationId, d.DocumentType, instrumentId)
		line := make([]string, 0, len(temp))

		for j := range temp {
			line = append(line, fmt.Sprintf("$%d", i*len(temp)+j+1))
		}

		args = append(args, temp...)
		values = append(values, fmt.Sprintf("(%s)", strings.Join(line, ", ")))
	}
	query += strings.Join(values, ", ")

	_, err := r.db.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *DocumentsRepo) UpdatePath(ctx context.Context, req *models.PathParts) (int64, error) {
	query := fmt.Sprintf(`UPDATE %s SET instrument_id=$2::uuid, verification_id=$1::uuid, path=REPLACE(path, 'temp', $2::text || '/' || $1::text)
		WHERE verification_id IS NULL AND (instrument_id IS NULL OR instrument_id=$2)`,
		DocumentsTable,
	)

	res, err := r.db.Exec(query, req.VerificationId, req.InstrumentId)
	if err != nil {
		return 0, fmt.Errorf("failed to execute query. error: %w", err)
	}

	count, err := res.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get number of rows affected. error: %w", err)
	}

	return count, nil
}

func (r *DocumentsRepo) DeleteById(ctx context.Context, id string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=$1`, DocumentsTable)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
