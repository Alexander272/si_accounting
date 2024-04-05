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
	GetByInstrumentId(context.Context, string) ([]models.VerificationDataDTO, error)
	Create(context.Context, models.CreateVerificationDTO) (string, error)
	Update(context.Context, models.UpdateVerificationDTO) error
}

// func (r *VerificationRepo) GetById(ctx context.Context, id string) ([]models.Verification, error) {
// query :=
// }

func (r *VerificationRepo) GetLast(ctx context.Context, instrumentId string) (*models.Verification, error) {
	query := fmt.Sprintf(`SELECT id, instrument_id, date, next_date, register_link, status, notes FROM %s
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

	// date, err := strconv.ParseInt(verification.Date, 10, 64)
	// if err != nil {
	// 	return nil, fmt.Errorf("failed to parse date. error: %w", err)
	// }
	// verification.Date = time.Unix(date, 0).Format(constants.DateFormat)

	// nextDate, err := strconv.ParseInt(verification.NextDate, 10, 64)
	// if err != nil {
	// 	return nil, fmt.Errorf("failed to parse date. error: %w", err)
	// }
	// if nextDate > 0 {
	// 	verification.NextDate = time.Unix(nextDate, 0).Format(constants.DateFormat)
	// }

	return verification, nil
}

// func (r *VerificationRepo) GetByInstrumentId(ctx context.Context, instrumentId string) (verifications []models.Verification, err error) {
// 	query := fmt.Sprintf(`SELECT id, instrument_id, register_link, status, date, next_date, notes FROM %s
// 	 	WHERE instrument_id=$1 ORDER BY created_at, id`,
// 		VerificationTable,
// 	)
// 	// TODO мне еще нужны файлы (документы)

// 	if err := r.db.Select(&verifications, query, instrumentId); err != nil {
// 		return nil, fmt.Errorf("failed to execute query. error: %w", err)
// 	}
// 	return verifications, nil
// }

func (r *VerificationRepo) GetByInstrumentId(ctx context.Context, instrumentId string) ([]models.VerificationDataDTO, error) {
	var data []pq_models.VerificationFullData
	query := fmt.Sprintf(`SELECT v.id, v.instrument_id, register_link, status, date, next_date, notes,
		COALESCE(d.id::text, '') AS doc_id, COALESCE(d.label, '') AS label, COALESCE(d.size,0) AS size, COALESCE(d.path,'') AS path, COALESCE(d.type,'') AS type
		FROM %s AS v LEFT JOIN %s AS d ON verification_id=v.id WHERE v.instrument_id=$1 ORDER BY date DESC, v.created_at DESC, id`,
		VerificationTable, DocumentsTable,
	)

	if err := r.db.Select(&data, query, instrumentId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	verifications := []models.VerificationDataDTO{}

	for i, d := range data {
		emptyDoc := false
		if d.DocId == "" {
			emptyDoc = true
		}
		doc := models.Document{
			Id:           d.DocId,
			Label:        d.Label,
			Size:         d.Size,
			Path:         d.Path,
			DocumentType: d.DocumentType,
		}

		if i == 0 || verifications[len(verifications)-1].Id != d.Id {
			docs := []models.Document{}
			if !emptyDoc {
				docs = append(docs, doc)
			}

			verifications = append(verifications, models.VerificationDataDTO{
				Id:           d.Id,
				InstrumentId: d.InstrumentId,
				Date:         d.Date,
				NextDate:     d.NextDate,
				// Date:         time.Unix(d.Date, 0).Format(constants.DateFormat),
				// NextDate:     time.Unix(d.NextDate, 0).Format(constants.DateFormat),
				// FileLink:     d.FileLink,
				RegisterLink: d.RegisterLink,
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

//TODO чтобы избавиться от разницы в 5 часов надо из значения вычесть 18000

func (r *VerificationRepo) Create(ctx context.Context, v models.CreateVerificationDTO) (string, error) {
	query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date, next_date, register_link, status, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		VerificationTable,
	)
	id := uuid.New()

	// date, err := time.Parse(constants.DateFormat, v.Date)
	// if err != nil {
	// 	return "", fmt.Errorf("failed to parse date. error: %w", err)
	// }
	// nextDate := time.Unix(0, 0)
	// if v.NextDate != "" {
	// 	nextDate, err = time.Parse(constants.DateFormat, v.NextDate)
	// 	if err != nil {
	// 		return "", fmt.Errorf("failed to parse date. error: %w", err)
	// 	}
	// }

	_, err := r.db.Exec(query, id, v.InstrumentId, v.Date, v.NextDate, v.RegisterLink, v.Status, v.Notes)
	if err != nil {
		return "", fmt.Errorf("failed to execute query. error: %w", err)
	}
	return id.String(), nil
}

func (r *VerificationRepo) Update(ctx context.Context, v models.UpdateVerificationDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET date=$1, register_link=$2, status=$3, next_date=$4, notes=$5 WHERE id=$6`,
		VerificationTable,
	)

	// date, err := time.Parse(constants.DateFormat, v.Date)
	// if err != nil {
	// 	return fmt.Errorf("failed to parse date. error: %w", err)
	// }
	// nextDate := time.Unix(0, 0)
	// if v.NextDate != "" {
	// 	nextDate, err = time.Parse(constants.DateFormat, v.NextDate)
	// 	if err != nil {
	// 		return fmt.Errorf("failed to parse date. error: %w", err)
	// 	}
	// }

	_, err := r.db.Exec(query, v.Date, v.RegisterLink, v.Status, v.NextDate, v.Notes, v.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
