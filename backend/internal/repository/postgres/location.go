package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
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
	GetByInstrumentId(context.Context, string) ([]*models.Location, error)
	FilterByDepartments(context.Context, *models.DepartmentFilterDTO) ([]string, error)
	Create(context.Context, *models.CreateLocationDTO) error
	CreateSeveral(context.Context, []*models.CreateLocationDTO) error
	Update(context.Context, *models.UpdateLocationDTO) error
	UpdatePlace(context.Context, *models.UpdatePlaceDTO) error
	UpdatePerson(context.Context, *models.UpdatePlaceDTO) error
	Receiving(context.Context, *models.ReceivingDTO) error
	ForcedReceiptMany(context.Context) error
	ForcedReceipt(context.Context, *models.ForcedReceiptDTO) error
	Delete(context.Context, string) error
}

func (r *LocationRepo) GetLast(ctx context.Context, instrumentId string) (*models.Location, error) {
	query := fmt.Sprintf(`SELECT id, instrument_id, date_of_issue, date_of_receiving, status, need_confirmed,
		COALESCE(person_id::text, '') AS person_id, COALESCE(department_id::text, '') AS department_id
		FROM %s WHERE instrument_id=$1 ORDER BY date_of_issue DESC, created_at DESC LIMIT 1`,
		SIMovementTable,
	)
	location := &models.Location{}

	if err := r.db.Get(location, query, instrumentId); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRows
		}
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	return location, nil
}

func (r *LocationRepo) GetByInstrumentId(ctx context.Context, instrumentId string) ([]*models.Location, error) {
	// var data []pq_models.LocationData
	query := fmt.Sprintf(`SELECT id, instrument_id, status, date_of_receiving, date_of_issue, place, 
		COALESCE(person_id::text, '') AS person_id, COALESCE(department_id::text, '') AS department_id, need_confirmed, has_confirmed
		FROM %s WHERE instrument_id=$1 ORDER BY date_of_issue DESC, created_at DESC, id`,
		SIMovementTable,
	)
	locations := []*models.Location{}

	if err := r.db.Select(&locations, query, instrumentId); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	return locations, nil
}

// Функция для того чтобы найти все инструменты которые находятся в определенном подразделении
func (r *LocationRepo) FilterByDepartments(ctx context.Context, filter *models.DepartmentFilterDTO) (instrumentIds []string, err error) {
	locations := []*models.Location{}
	query := fmt.Sprintf(`SELECT s.instrument_id FROM %s AS m LEFT JOIN LATERAL (SELECT instrument_id, department_id 
		FROM %s WHERE instrument_id=m.instrument_id ORDER BY date_of_issue DESC, created_at DESC LIMIT 1) AS s ON TRUE
		WHERE s.instrument_id=ANY($1) AND s.department_id=ANY($2) AND status=$3`,
		SIMovementTable, SIMovementTable,
	)
	if filter.Status == "" {
		filter.Status = constants.LocationStatusUsed
	}

	if err := r.db.Select(&locations, query, pq.Array(filter.InstrumentIds), pq.Array(filter.DepartmentIds), filter.Status); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	for _, l := range locations {
		instrumentIds = append(instrumentIds, l.InstrumentId)
	}
	return instrumentIds, nil
}

func (r *LocationRepo) Create(ctx context.Context, l *models.CreateLocationDTO) error {
	// query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date_of_issue, date_of_receiving, status, need_confirmed, person_id, department_id, place, person)
	// 	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE((
	// 		SELECT d.name || ' ('|| e.name || ')' FROM %s AS e LEFT JOIN %s AS d ON department_id=d.id WHERE e.id=$7
	// 	), '')), COALESCE((SELECT name FROM %s WHERE id=$7 , ''))`,
	// 	SIMovementTable, EmployeeTable, DepartmentTable,
	// )
	// query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date_of_issue, date_of_receiving, status, need_confirmed, person_id, department_id, place,
	// 	person, last_place)
	// 	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE((SELECT name FROM %s WHERE id=$8), ''), COALESCE((SELECT name FROM %s WHERE id=$7), ''),
	// 	COALESCE((SELECT place FROM %s WHERE instrument_id=$2 ORDER BY created_at DESC LIMIT 1), ''))`,
	// 	SIMovementTable, DepartmentTable, EmployeeTable, SIMovementTable,
	// )
	query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date_of_issue, date_of_receiving, status, need_confirmed, 
		person_id, department_id, place, person, last_place, last_place_id)
		SELECT id::uuid, instrument_id::uuid, date_of_issue::integer, date_of_receiving::integer, status, need_confirmed::boolean, person_id::uuid, 
			s.department_id::uuid,	COALESCE(d.name, ''), COALESCE(e.name, ''), COALESCE(m.place, ''), COALESCE(m.department_id::text, '')
		FROM (VALUES ($1, $2, $3, $4, $5, $6, $7, $8))
		AS s(id, instrument_id, date_of_issue, date_of_receiving, status, need_confirmed, person_id, department_id) 
		LEFT JOIN LATERAL (SELECT place, department_id FROM %s WHERE instrument_id=s.instrument_id::uuid ORDER BY created_at DESC LIMIT 1) AS m ON true
		LEFT JOIN LATERAL (SELECT name FROM %s WHERE id=s.person_id::uuid) AS e ON true
		LEFT JOIN LATERAL (SELECT name FROM %s WHERE id=s.department_id::uuid) AS d ON true`,
		SIMovementTable, SIMovementTable, EmployeeTable, DepartmentTable,
	)
	id := uuid.New()

	status := l.Status
	if status == "" {
		status = constants.LocationStatusUsed
	}

	var personId *string = &l.PersonId
	if l.PersonId == "" {
		personId = nil
	}
	var departmentId *string = &l.DepartmentId
	if l.DepartmentId == "" {
		departmentId = nil
	}

	_, err := r.db.Exec(query, id, l.InstrumentId, l.DateOfIssue, l.DateOfReceiving, status, l.NeedConfirmed, personId, departmentId)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *LocationRepo) CreateSeveral(ctx context.Context, locations []*models.CreateLocationDTO) error {
	// query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date_of_issue, date_of_receiving, status, need_confirmed, person_id,
	// 	department_id, place, person, last_place) VALUES `,
	// 	SIMovementTable,
	// )
	// subQuery := fmt.Sprintf(`SELECT d.name || ' ('|| e.name || ')' FROM %s AS e LEFT JOIN %s AS d ON department_id=d.id WHERE e.id=$`,
	// 	EmployeeTable, DepartmentTable,
	// )
	// subDepQuery := fmt.Sprintf(`SELECT name FROM %s WHERE id=$`, DepartmentTable)
	// subEmpQuery := fmt.Sprintf(`SELECT name FROM %s WHERE id=$`, EmployeeTable)
	// subPlaceQuery := fmt.Sprintf(`SELECT place FROM %s WHERE instrument_id=$`, SIMovementTable)

	args := make([]interface{}, 0)
	values := make([]string, 0, len(locations))

	c := 8
	for i, l := range locations {
		id := uuid.New()
		// values = append(values, fmt.Sprintf(" ($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, COALESCE((%s%d), ''), COALESCE((%s%d), ''), COALESCE((%s%d ORDER BY created_at DESC LIMIT 1), ''))",
		// 	i*c+1, i*c+2, i*c+3, i*c+4, i*c+5, i*c+6, i*c+7, i*c+8, subDepQuery, i*c+8, subEmpQuery, i*c+7, subPlaceQuery, i*c+2),
		// )
		values = append(values, fmt.Sprintf("($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d)", i*c+1, i*c+2, i*c+3, i*c+4, i*c+5, i*c+6, i*c+7, i*c+8))

		status := l.Status
		if status == "" {
			status = constants.LocationStatusUsed
		}
		var personId *string = &l.PersonId
		if l.PersonId == "" {
			personId = nil
		}
		var departmentId *string = &l.DepartmentId
		if l.DepartmentId == "" {
			departmentId = nil
		}

		args = append(args, id, l.InstrumentId, l.DateOfIssue, l.DateOfReceiving, status, l.NeedConfirmed, personId, departmentId)
	}

	query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date_of_issue, date_of_receiving, status, need_confirmed, 
		person_id, department_id, place, person, last_place, last_place_id)
		SELECT id::uuid, instrument_id::uuid, date_of_issue::integer, date_of_receiving::integer, status, need_confirmed::boolean, 
			person_id::uuid, s.department_id::uuid, COALESCE(d.name, ''), COALESCE(e.name, ''), COALESCE(m.place, ''), COALESCE(m.department_id::text, '')
		FROM (VALUES %s) AS s(id, instrument_id, date_of_issue, date_of_receiving, status, need_confirmed, person_id, department_id)
		LEFT JOIN LATERAL (SELECT name FROM %s WHERE id=s.person_id::uuid) AS e ON true
		LEFT JOIN LATERAL (SELECT name FROM %s WHERE id=s.department_id::uuid) AS d ON true
		LEFT JOIN LATERAL (SELECT place, department_id FROM %s WHERE instrument_id=s.instrument_id::uuid ORDER BY created_at DESC LIMIT 1) AS m ON true`,
		SIMovementTable, strings.Join(values, ", "), EmployeeTable, DepartmentTable, SIMovementTable,
	)

	// logger.Debug("create several", logger.StringAttr("query", query), logger.AnyAttr("args", args))

	// query += strings.Join(values, ", ")

	_, err := r.db.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *LocationRepo) Update(ctx context.Context, l *models.UpdateLocationDTO) error {
	// query := fmt.Sprintf(`UPDATE %s SET date_of_issue=$1, date_of_receiving=$2, status=$3, person_id=$4, department_id=$5,
	// 	place=COALESCE((SELECT d.name || ' ('|| e.name || ')' FROM %s AS e LEFT JOIN %s AS d ON department_id=d.id WHERE e.id=$4), '')
	// 	WHERE id=$6`,
	// 	SIMovementTable, EmployeeTable, DepartmentTable,
	// )
	query := fmt.Sprintf(`UPDATE %s SET date_of_issue=$1, date_of_receiving=$2, status=$3, person_id=$4, department_id=$5,
		place=COALESCE((SELECT name FROM %s WHERE id=$5), ''), person=COALESCE((SELECT name FROM %s WHERE id=$4), '')
		WHERE id=$6`,
		SIMovementTable, DepartmentTable, EmployeeTable,
	)

	_, err := r.db.Exec(query, l.DateOfIssue, l.DateOfReceiving, l.Status, l.PersonId, l.DepartmentId, l.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *LocationRepo) UpdatePlace(ctx context.Context, dto *models.UpdatePlaceDTO) error {
	// query := fmt.Sprintf(`UPDATE %s SET place=COALESCE((SELECT d.name || ' ('|| e.name || ')'
	// 		FROM %s AS e LEFT JOIN %s AS d ON department_id=d.id WHERE e.id=person_id), '')
	// 		WHERE department_id::text=$1 OR person_id::text=$2`,
	// 	SIMovementTable, EmployeeTable, DepartmentTable,
	// )
	query := fmt.Sprintf(`UPDATE %s SET place=COALESCE((SELECT name FROM %s WHERE id=department_id), '') WHERE id::text=$1`,
		SIMovementTable, DepartmentTable,
	)

	if _, err := r.db.ExecContext(ctx, query, dto.DepartmentId); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
func (r *LocationRepo) UpdatePerson(ctx context.Context, dto *models.UpdatePlaceDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET person=COALESCE((SELECT name FROM %s WHERE id=person_id), '') WHERE id::text=$1`,
		SIMovementTable, EmployeeTable,
	)

	if _, err := r.db.ExecContext(ctx, query, dto.PersonId); err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

// // По идее это все входит в update -> надо как-то переписать update чтобы записывались только переданные данные даже если они пустые
func (r *LocationRepo) Receiving(ctx context.Context, data *models.ReceivingDTO) error {
	// query := fmt.Sprintf(`UPDATE %s SET status=$1, date_of_receiving=$2 WHERE instrument_id=$3 AND date_of_receiving=0`, SIMovementTable)
	query := fmt.Sprintf(`UPDATE %s SET status=$1, date_of_receiving=$2, has_confirmed=$3 WHERE ARRAY[instrument_id] <@ $4 AND date_of_receiving=0`,
		SIMovementTable,
	)

	_, err := r.db.Exec(query, data.Status, time.Now().Unix(), data.HasConfirmed, pq.Array(data.InstrumentIds))
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *LocationRepo) ForcedReceiptMany(ctx context.Context) error {
	query := fmt.Sprintf(`UPDATE %s AS m SET date_of_receiving=$1, status=(
			SELECT CASE WHEN status='used' THEN 'reserve' ELSE 'used' END FROM %s
			WHERE instrument_id=m.instrument_id AND date_of_receiving!=0 ORDER BY date_of_issue DESC LIMIT 1
		) WHERE date_of_receiving=0 AND date_of_issue < $2`,
		SIMovementTable, SIMovementTable,
	)

	limit := time.Now().Add(-time.Hour * 24 * 20).Unix() //20 days ago
	_, err := r.db.Exec(query, time.Now().Unix(), limit)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
func (r *LocationRepo) ForcedReceipt(ctx context.Context, dto *models.ForcedReceiptDTO) error {
	query := fmt.Sprintf(`UPDATE %s AS m SET date_of_receiving=$1, status='used' WHERE instrument_id=$2 AND date_of_receiving=0`,
		SIMovementTable,
	)

	_, err := r.db.Exec(query, time.Now().Unix(), dto.InstrumentId)
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
	query := fmt.Sprintf(`DELETE FROM %s AS m WHERE id=$1 
		AND (SELECT COUNT(id) FROM %s WHERE instrument_id=m.instrument_id)>1`,
		SIMovementTable, SIMovementTable,
	)

	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}
