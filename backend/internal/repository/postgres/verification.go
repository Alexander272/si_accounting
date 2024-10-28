package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository/postgres/pq_models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type VerificationRepo struct {
	db *sqlx.DB
}

func NewVerificationRepo(db *sqlx.DB) *VerificationRepo {
	return &VerificationRepo{
		db: db,
	}
}

type Verification interface {
	GetLast(context.Context, string) (*models.Verification, error)
	GetByInstrumentId(context.Context, string) ([]*models.VerificationDataDTO, error)
	Create(context.Context, *models.CreateVerificationDTO) (string, error)
	Update(context.Context, *models.UpdateVerificationDTO) error
}

func (r *VerificationRepo) GetLast(ctx context.Context, instrumentId string) (*models.Verification, error) {
	query := fmt.Sprintf(`SELECT id, instrument_id, date, next_date, register_link, status, not_verified, notes FROM %s
		WHERE instrument_id=$1 ORDER BY date DESC LIMIT 1`,
		VerificationTable,
	)
	verification := &models.Verification{}

	if err := r.db.Get(verification, query, instrumentId); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	return verification, nil
}

func (r *VerificationRepo) GetByInstrumentId(ctx context.Context, instrumentId string) ([]*models.VerificationDataDTO, error) {
	var data []pq_models.VerificationFullData
	query := fmt.Sprintf(`SELECT v.id, v.instrument_id, register_link, status, date, next_date, notes, not_verified,
		COALESCE(d.id::text, '') AS doc_id, COALESCE(d.label, '') AS label, COALESCE(d.size,0) AS size, COALESCE(d.path,'') AS path, COALESCE(d.type,'') AS type
		FROM %s AS v LEFT JOIN %s AS d ON verification_id=v.id WHERE v.instrument_id=$1 ORDER BY date DESC, v.created_at DESC, id`,
		VerificationTable, DocumentsTable,
	)

	if err := r.db.Select(&data, query, instrumentId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	verifications := []*models.VerificationDataDTO{}

	for i, d := range data {
		emptyDoc := false
		if d.DocId == "" {
			emptyDoc = true
		}
		doc := &models.Document{
			Id:           d.DocId,
			Label:        d.Label,
			Size:         d.Size,
			Path:         d.Path,
			DocumentType: d.DocumentType,
		}

		if i == 0 || verifications[len(verifications)-1].Id != d.Id {
			docs := []*models.Document{}
			if !emptyDoc {
				docs = append(docs, doc)
			}

			verifications = append(verifications, &models.VerificationDataDTO{
				Id:           d.Id,
				InstrumentId: d.InstrumentId,
				Date:         d.Date,
				NextDate:     d.NextDate,
				RegisterLink: d.RegisterLink,
				NotVerified:  d.NotVerified,
				Status:       d.Status,
				Notes:        d.Notes,
				Documents:    docs,
			})
		} else if !emptyDoc {
			verifications[len(verifications)-1].Documents = append(verifications[len(verifications)-1].Documents, doc)
		}
	}

	return verifications, nil
}

func (r *VerificationRepo) Create(ctx context.Context, v *models.CreateVerificationDTO) (string, error) {
	query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date, next_date, register_link, status, not_verified, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		VerificationTable,
	)
	id := uuid.New()

	_, err := r.db.ExecContext(ctx, query, id, v.InstrumentId, v.Date, v.NextDate, v.RegisterLink, v.Status, v.NotVerified, v.Notes)
	if err != nil {
		return "", fmt.Errorf("failed to execute query. error: %w", err)
	}
	return id.String(), nil
}

func (r *VerificationRepo) Update(ctx context.Context, v *models.UpdateVerificationDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET date=$1, register_link=$2, status=$3, next_date=$4, notes=$5, not_verified=$6 WHERE id=$7`,
		VerificationTable,
	)

	_, err := r.db.Exec(query, v.Date, v.RegisterLink, v.Status, v.NextDate, v.Notes, v.NotVerified, v.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
