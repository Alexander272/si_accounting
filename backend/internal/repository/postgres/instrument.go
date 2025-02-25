package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type InstrumentRepo struct {
	db *sqlx.DB
}

func NewInstrumentRepo(db *sqlx.DB) *InstrumentRepo {
	return &InstrumentRepo{
		db: db,
	}
}

type Instrument interface {
	Get(context.Context, *models.GetInstrumentsDTO) ([]*models.Instrument, error)
	GetById(context.Context, string) (*models.Instrument, error)
	Create(context.Context, *models.CreateInstrumentDTO) (string, error)
	Update(context.Context, *models.UpdateInstrumentDTO) error
	ChangeStatus(context.Context, *models.UpdateStatus) error
	Delete(context.Context, string) error
}

func (r *InstrumentRepo) Get(ctx context.Context, req *models.GetInstrumentsDTO) ([]*models.Instrument, error) {
	query := fmt.Sprintf(`SELECT id, name, type, factory_number, measurement_limits, accuracy, state_register, manufacturer,
		year_of_issue, inter_verification_interval, notes, status FROM %s WHERE id::text=ANY($1)`,
		InstrumentTable,
	)
	instruments := make([]*models.Instrument, 0)

	if err := r.db.SelectContext(ctx, &instruments, query, pq.Array(req.IDs)); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}
	return instruments, nil
}

func (r *InstrumentRepo) GetById(ctx context.Context, id string) (*models.Instrument, error) {
	query := fmt.Sprintf(`SELECT id, name, type, factory_number, measurement_limits, accuracy, state_register, manufacturer,
		year_of_issue, inter_verification_interval, notes, status FROM %s WHERE CASE WHEN $1='' OR $1='draft' THEN status=$2 ELSE id::text=$1 END LIMIT 1`,
		InstrumentTable,
	)
	instrument := &models.Instrument{}

	if err := r.db.Get(instrument, query, id, constants.InstrumentDraft); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	return instrument, nil
}

func (r *InstrumentRepo) Create(ctx context.Context, in *models.CreateInstrumentDTO) (string, error) {
	query := fmt.Sprintf(`INSERT INTO %s(id, realm_id, name, type, factory_number, measurement_limits, accuracy, state_register, manufacturer, 
		year_of_issue, inter_verification_interval, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
		InstrumentTable,
	)
	id := uuid.New()

	_, err := r.db.Exec(query, id, in.Name, in.RealmId, in.Type, in.FactoryNumber, in.MeasurementLimits, in.Accuracy, in.StateRegister, in.Manufacturer,
		in.YearOfIssue, in.InterVerificationInterval, in.Notes, constants.InstrumentDraft,
	)
	if err != nil {
		return "", fmt.Errorf("failed to execute query. error: %w", err)
	}
	return id.String(), nil
}

func (r *InstrumentRepo) Update(ctx context.Context, in *models.UpdateInstrumentDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET name=$1, type=$2, factory_number=$3, measurement_limits=$4, accuracy=$5, state_register=$6, manufacturer=$7, 
		year_of_issue=$8, inter_verification_interval=$9, notes=$10 WHERE id=$11`,
		InstrumentTable,
	)

	_, err := r.db.Exec(query, in.Name, in.Type, in.FactoryNumber, in.MeasurementLimits, in.Accuracy, in.StateRegister, in.Manufacturer,
		in.YearOfIssue, in.InterVerificationInterval, in.Notes, in.Id,
	)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *InstrumentRepo) ChangeStatus(ctx context.Context, status *models.UpdateStatus) error {
	query := fmt.Sprintf(`UPDATE %s SET status=$1 WHERE id=$2`, InstrumentTable)

	_, err := r.db.Exec(query, status.Status, status.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *InstrumentRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=$1`, InstrumentTable)
	// query := fmt.Sprintf(`UPDATE %s SET status='deleted' WHERE id=$1`, InstrumentTable)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
