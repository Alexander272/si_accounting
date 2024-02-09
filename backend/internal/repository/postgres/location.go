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
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
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
	Create(context.Context, models.CreateLocationDTO) error
	Update(context.Context, models.UpdateLocationDTO) error
	Receiving(context.Context, models.ReceivingDTO) error
	Delete(context.Context, string) error
}

// TODO заменить везде даты со строк на числа
func (r *LocationRepo) GetLast(ctx context.Context, instrumentId string) (*models.Location, error) {
	query := fmt.Sprintf(`SELECT id, instrument_id, date_of_issue, date_of_receiving, status, person, department
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
	location.DateOfIssue = time.Unix(issueDate, 0).Format("02.01.2006")

	receiptDate, err := strconv.ParseInt(location.DateOfReceiving, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse receipt date. error: %w", err)
	}
	location.DateOfReceiving = ""
	if receiptDate > 0 {
		location.DateOfReceiving = time.Unix(receiptDate, 0).Format("02.01.2006")
	}

	return location, nil
}

// TODO наверное стоит записывать id работника и департамента, а текстовые поля которые есть сейчас соединить так же как и при запросе в новом поле

func (r *LocationRepo) Create(ctx context.Context, l models.CreateLocationDTO) error {
	query := fmt.Sprintf(`INSERT INTO %s(id, instrument_id, date_of_issue, date_of_receiving, status, person, department)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		SIMovementTable,
	)
	id := uuid.New()

	status := l.Status
	if status == "" {
		status = constants.LocationStatusUsed
	}

	issueDate, err := time.Parse("02.01.2006", l.DateOfIssue)
	if err != nil {
		return fmt.Errorf("failed to parse issue date. error: %w", err)
	}
	receiptDate := time.Unix(0, 0)
	if l.DateOfReceiving != "" {
		receiptDate, err = time.Parse("02.01.2006", l.DateOfReceiving)
		if err != nil {
			return fmt.Errorf("failed to parse receipt date. error: %w", err)
		}
	}

	_, err = r.db.Exec(query, id, l.InstrumentId, issueDate.Unix(), receiptDate.Unix(), status, l.Person, l.Department)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

func (r *LocationRepo) Update(ctx context.Context, l models.UpdateLocationDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET date_of_issue=$1, date_of_receiving=$2, status=$3, person=$4, department=$5 WHERE id=$6`,
		SIMovementTable,
	)

	issueDate, err := time.Parse("02.01.2006", l.DateOfIssue)
	if err != nil {
		return fmt.Errorf("failed to parse issue date. error: %w", err)
	}
	receiptDate := time.Unix(0, 0)
	if l.DateOfReceiving != "" {
		receiptDate, err = time.Parse("02.01.2006", l.DateOfReceiving)
		if err != nil {
			return fmt.Errorf("failed to parse receipt date. error: %w", err)
		}
	}

	_, err = r.db.Exec(query, issueDate.Unix(), receiptDate.Unix(), l.Status, l.Person, l.Department, l.Id)
	if err != nil {
		return fmt.Errorf("failed to execute query. error: %w", err)
	}
	return nil
}

// // По идее это все входит в update -> надо как-то переписать update чтобы записывались только переданные данные даже если они пустые
func (r *LocationRepo) Receiving(ctx context.Context, data models.ReceivingDTO) error {
	query := fmt.Sprintf(`UPDATE %s SET status=$1, date_of_receiving=$2 WHERE instrument_id=$3 AND date_of_receiving=0`, SIMovementTable)

	receiptDate, err := time.Parse("02.01.2006", data.DateOfReceiving)
	if err != nil {
		return fmt.Errorf("failed to parse receipt date. error: %w", err)
	}

	_, err = r.db.Exec(query, data.Status, receiptDate.Unix(), data.InstrumentId)
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
