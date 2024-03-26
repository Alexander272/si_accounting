package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository/postgres/pq_models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type LocationRepo struct {
	db *sqlx.DB
}

func NewLocationRepo(db *sqlx.DB) *LocationRepo {
	return &LocationRepo{
		db: db,
	}
}

type Location interface {
	GetLast(context.Context, string) (*models.Location, error)
	GetByInstrumentId(context.Context, string) ([]models.Location, error)
	Create(context.Context, models.CreateLocationDTO) error
	Update(context.Context, models.UpdateLocationDTO) error
	Receiving(context.Context, models.ReceivingDTO) error
	Delete(context.Context, string) error
}

func (r *LocationRepo) GetLast(ctx context.Context, instrumentId string) (*models.Location, error) {
	query := fmt.Sprintf(`SELECT id, instrument_id, date_of_issue, date_of_receiving, status, need_confirmed, person_id, department_id
		FROM %s WHERE instrument_id=$1 ORDER BY date_of_issue LIMIT 1`,
		SIMovementTable,
	)
	location := &models.Location{}

	if err := r.db.Get(location, query, instrumentId); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	issueDate, err := strconv.ParseInt(location.DateOfIssue, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse issue date. error: %w", err)
	}
	location.DateOfIssue = time.Unix(issueDate, 0).Format(constants.DateFormat)

	receiptDate, err := strconv.ParseInt(location.DateOfReceiving, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse receipt date. error: %w", err)
	}
	location.DateOfReceiving = ""
	if receiptDate > 0 {
		location.DateOfReceiving = time.Unix(receiptDate, 0).Format(constants.DateFormat)
	}

	return location, nil
}

func (r *LocationRepo) GetByInstrumentId(ctx context.Context, instrumentId string) ([]models.Location, error) {
	var data []pq_models.LocationData
	query := fmt.Sprintf(`SELECT id, instrument_id, status, date_of_receiving, date_of_issue, place, 
		COALESCE(person_id::text, '') AS person_id, COALESCE(department_id::text, '') AS department_id, need_confirmed
		FROM %s WHERE instrument_id=$1 ORDER BY date_of_issue DESC, created_at DESC, id`,
		SIMovementTable,
	)

	if err := r.db.Select(&data, query, instrumentId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	locations := []models.Location{}

	for _, loc := range data {
		receiptDate := ""
		if loc.DateOfReceiving > 0 {
			receiptDate = time.Unix(loc.DateOfReceiving, 0).Format(constants.DateFormat)
		}

		locations = append(locations, models.Location{
			Id:              loc.Id,
			InstrumentId:    loc.Id,
			Place:           loc.Place,
			PersonId:        loc.PersonId,
			DepartmentId:    loc.DepartmentId,
			DateOfIssue:     time.Unix(loc.DateOfIssue, 0).Format(constants.DateFormat),
			DateOfReceiving: receiptDate,
			Status:          loc.Status,
			NeedConfirmed:   loc.NeedConfirmed,
		})
	}

	return locations, nil
}

// func (r *LocationRepo) GetByInstrumentId(ctx context.Context, instrumentId string) (locations []models.Location, err error) {
// 	query := fmt.Sprintf(`SELECT id, instrument_id, status, date_of_receiving, date_of_issue, person, department,
// 		COALESCE(person_id::text, '') AS person_id, COALESCE(department_id::text, '') AS department_id, need_confirmed
// 		FROM %s WHERE instrument_id=$1 ORDER BY date_of_issue DESC, created_at DESC, id`,
// 		SIMovementTable,
// 	)

// 	if err := r.db.Select(&locations, query, instrumentId); err != nil {
// 		return nil, fmt.Errorf("failed to execute query. error: %w", err)
// 	}

// 	for i, loc := range locations {
// 		issueDate, err := strconv.ParseInt(loc.DateOfIssue, 10, 64)
// 		if err != nil {
// 			return nil, fmt.Errorf("failed to parse issue date. error: %w", err)
// 		}
// 		locations[i].DateOfIssue = time.Unix(issueDate, 0).Format(constants.DateFormat)

// 		receiptDate, err := strconv.ParseInt(loc.DateOfReceiving, 10, 64)
// 		if err != nil {
// 			return nil, fmt.Errorf("failed to parse receipt date. error: %w", err)
// 		}
// 		locations[i].DateOfReceiving = ""
// 		if receiptDate > 0 {
// 			locations[i].DateOfReceiving = time.Unix(receiptDate, 0).Format(constants.DateFormat)
// 		}
// 	}

// 	return locations, nil
// }

func (r *LocationRepo) Create(ctx context.Context, l models.CreateLocationDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date_of_issue, date_of_receiving, status, need_confirmed, person_id, department_id, place)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE((
			SELECT d.name || ' ('|| e.name || ')' FROM %s AS e LEFT JOIN %s AS d ON department_id=d.id WHERE e.id=$7
		), ''))`,
		SIMovementTable, EmployeeTable, DepartmentTable,
	)
	id := uuid.New()

	status := l.Status
	if status == "" {
		status = constants.LocationStatusUsed
	}

	issueDate, err := time.Parse(constants.DateFormat, l.DateOfIssue)
	if err != nil {
		return fmt.Errorf("failed to parse issue date. error: %w", err)
	}
	receiptDate := time.Unix(0, 0)
	if l.DateOfReceiving != "" {
		receiptDate, err = time.Parse(constants.DateFormat, l.DateOfReceiving)
		if err != nil {
			return fmt.Errorf("failed to parse receipt date. error: %w", err)
		}
	}

	var personId *string = &l.PersonId
	if l.PersonId == "" {
		personId = nil
	}
	var departmentId *string = &l.DepartmentId
	if l.DepartmentId == "" {
		departmentId = nil
	}

	_, err = r.db.Exec(query, id, l.InstrumentId, issueDate.Unix(), receiptDate.Unix(), status, l.NeedConfirmed, personId, departmentId)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *LocationRepo) Update(ctx context.Context, l models.UpdateLocationDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET date_of_issue=$1, date_of_receiving=$2, status=$3, person_id=$4, department_id=$5,
		place=COALESCE((SELECT d.name || ' ('|| e.name || ')' FROM %s AS e LEFT JOIN %s AS d ON department_id=d.id WHERE e.id=$4), '')
		WHERE id=$6`,
		SIMovementTable, EmployeeTable, DepartmentTable,
	)

	issueDate, err := time.Parse(constants.DateFormat, l.DateOfIssue)
	if err != nil {
		return fmt.Errorf("failed to parse issue date. error: %w", err)
	}
	receiptDate := time.Unix(0, 0)
	if l.DateOfReceiving != "" {
		receiptDate, err = time.Parse(constants.DateFormat, l.DateOfReceiving)
		if err != nil {
			return fmt.Errorf("failed to parse receipt date. error: %w", err)
		}
	}

	_, err = r.db.Exec(query, issueDate.Unix(), receiptDate.Unix(), l.Status, l.PersonId, l.DepartmentId, l.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

// // По идее это все входит в update -> надо как-то переписать update чтобы записывались только переданные данные даже если они пустые
func (r *LocationRepo) Receiving(ctx context.Context, data models.ReceivingDTO) error {
	// query := fmt.Sprintf(`UPDATE %s SET status=$1, date_of_receiving=$2 WHERE instrument_id=$3 AND date_of_receiving=0`, SIMovementTable)
	query := fmt.Sprintf(`UPDATE %s SET status=$1, date_of_receiving=$2 WHERE ARRAY[instrument_id] <@ $3 AND date_of_receiving=0`, SIMovementTable)

	// receiptDate, err := time.Parse(constants.DateFormat, data.DateOfReceiving)
	// if err != nil {
	// 	return fmt.Errorf("failed to parse receipt date. error: %w", err)
	// }

	_, err := r.db.Exec(query, data.Status, time.Now().Unix(), pq.Array(data.InstrumentIds))
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *LocationRepo) ReceivingFromBot(ctx context.Context) error {
	// если пользователь лидер то будут обновляться все инструменты в соответствующем подразделении
	// если пользователь не лидер то нужно обновить только инструмент закрепленный за ним
	// если работники сами получают инструменты, то лидера подразделения указывать не нужно
	// если подразделение и работник не указаны значит инструмент сдают в резерв (//? тут могут быть проблемы, если несколько пользователей отправят инструменты)
	// может все таки нужно делать кнопочку в каждом таком списке, либо надо чтобы пользователи указывали id поста

	// query := fmt.Sprintf(``)

	return fmt.Errorf("not implemented")
}

func (r *LocationRepo) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf(`DELETE FROM %s WHERE id=$1`, SIMovementTable)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
