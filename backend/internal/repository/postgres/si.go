package postgres

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type SIRepo struct {
	db *sqlx.DB
}

func NewSIRepo(db *sqlx.DB) *SIRepo {
	return &SIRepo{
		db: db,
	}
}

type SI interface {
	GetAll(context.Context, models.SIParams) (*models.SIList, error)
	GetForNotification(context.Context, models.Period) ([]models.Notification, error)
}

func (r *SIRepo) GetAll(ctx context.Context, req models.SIParams) (*models.SIList, error) {
	list := &models.SIList{}

	order := " ORDER BY "
	if req.Sort.Field != "" {
		order += fmt.Sprintf("%s %s, ", req.Sort.Field, req.Sort.Type)
	}
	order += "created_at, id"

	filter := ""
	params := []interface{}{}
	count := 1

	// TODO а почему тут номера параметров прописаны цифрами, если я захочу сделать возможность добавления нескольких фильтров это перестанет работать
	switch req.Filter.CompareType {
	case "contains":
		filter = fmt.Sprintf("AND LOWER(%s) LIKE LOWER('%%'||$1||'%%')", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "start":
		filter = fmt.Sprintf("AND LOWER(%s) LIKE LOWER($1||'%%')", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "end":
		filter = fmt.Sprintf("AND LOWER(%s) LIKE LOWER('%%'||$1)", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "equals":
		if req.Filter.FieldType == "string" {
			filter = fmt.Sprintf("AND LOWER(%s)=LOWER($1)", req.Filter.Field)
		} else if req.Filter.FieldType == "list" {
			// LOWER(place) ~* 'test|Отдел технического сервиса'
			// LOWER(place) ILIKE ANY (ARRAY['test %','Отдел технического сервиса %'])
			filter = fmt.Sprintf("AND LOWER(%s) ~* $1", req.Filter.Field)
			req.Filter.Values[0] = strings.ReplaceAll(req.Filter.Values[0], ",", "|")
		} else {
			filter = fmt.Sprintf("AND %s=$1", req.Filter.Field)
		}
		params = append(params, req.Filter.Values[0])
		count++
	case "more":
		filter = fmt.Sprintf("AND %s>$1", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "less":
		filter = fmt.Sprintf("AND %s<$1", req.Filter.Field)
		params = append(params, req.Filter.Values[0])
		count++
	case "period":
		filter = fmt.Sprintf("AND %s>$1 AND %s<$2", req.Filter.Field, req.Filter.Field)
		params = append(params, req.Filter.Values[0], req.Filter.Values[1])
		count += 2
	}

	params = append(params, req.Page.Limit, req.Page.Offset)

	query := fmt.Sprintf(`SELECT id, name, type, factory_number, measurement_limits, accuracy, state_register, manufacturer, year_of_issue, 
		inter_verification_interval, notes, i.status, v.date, v.next_date, m.place, COUNT(*) OVER() as total_count
		FROM %s AS i
		LEFT JOIN LATERAL (SELECT date, next_date FROM %s WHERE instrument_id=i.id ORDER BY date DESC, created_at DESC LIMIT 1) AS v ON TRUE
		LEFT JOIN LATERAL (SELECT (CASE WHEN status='%s' THEN place WHEN status='%s' THEN 'Резерв' ELSE 'Перемещение' END) as place 
			FROM %s WHERE instrument_id=i.id ORDER BY date_of_issue DESC, created_at DESC LIMIT 1) as m ON TRUE
		WHERE i.status='%s' %s %s LIMIT $%d OFFSET $%d`,
		InstrumentTable, VerificationTable, constants.LocationStatusUsed, constants.LocationStatusReserve, SIMovementTable, constants.InstrumentStatusWork,
		filter, order, count, count+1,
	)

	// logger.Debug(query)

	if err := r.db.Select(&list.SI, query, params...); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	for i, s := range list.SI {
		date, err := strconv.ParseInt(s.Date, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse date. error: %w", err)
		}
		list.SI[i].Date = time.Unix(date, 0).Format("02.01.2006")

		nextDate, err := strconv.ParseInt(s.NextDate, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse date. error: %w", err)
		}
		if nextDate > 0 {
			list.SI[i].NextDate = time.Unix(nextDate, 0).Format("02.01.2006")
		}
	}

	if len(list.SI) > 0 {
		list.Total = list.SI[0].Total
	}

	return list, nil
}

func (r *SIRepo) GetForNotification(ctx context.Context, req models.Period) (nots []models.Notification, err error) {
	var data []models.SIFromNotification
	query := fmt.Sprintf(`SELECT i.id, i.name, factory_number, v.date, v.next_date, e.name AS person, d.name AS department,
		(CASE WHEN e.most_id != '' THEN e.most_id ELSE l.most_id END) AS most_id
		FROM %s AS i
		LEFT JOIN LATERAL (SELECT date, next_date FROM %s WHERE instrument_id=i.id ORDER BY date DESC, created_at DESC LIMIT 1) AS v ON TRUE
		LEFT JOIN LATERAL (SELECT person_id, department_id, status FROM %s WHERE instrument_id=i.id ORDER BY date_of_issue DESC, created_at DESC LIMIT 1) AS m ON TRUE
		LEFT JOIN %s AS e ON e.id=m.person_id
		LEFT JOIN %s AS d ON d.id=m.department_id
		LEFT JOIN LATERAL (SELECT most_id FROM %s WHERE department_id=m.department_id AND is_lead=true) AS l ON true
		WHERE m.status='%s' AND next_date>=$1 AND next_date<=$2
		ORDER BY most_id, next_date`,
		InstrumentTable, VerificationTable, SIMovementTable, EmployeeTable, DepartmentTable, EmployeeTable, constants.LocationStatusUsed,
	)

	startAt, err := time.Parse("02.01.2006", req.StartAt)
	if err != nil {
		return nil, fmt.Errorf("failed to parse start date. error: %w", err)
	}
	finishAt, err := time.Parse("02.01.2006", req.FinishAt)
	if err != nil {
		return nil, fmt.Errorf("failed to parse finish date. error: %w", err)
	}

	if err := r.db.Select(&data, query, startAt.Unix(), finishAt.Unix()); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	for i, sn := range data {
		si := models.SelectedSI{
			Id:            sn.Id,
			Name:          sn.Name,
			FactoryNumber: sn.FactoryNumber,
			Person:        sn.Person,
		}

		if i == 0 || nots[len(nots)-1].MostId != sn.MostId {
			nots = append(nots, models.Notification{
				MostId: sn.MostId,
				SI:     []models.SelectedSI{si},
			})
		} else {
			nots[len(nots)-1].SI = append(nots[len(nots)-1].SI, si)
		}
	}

	return nots, nil
}

/*
получение most_id сотрудника

SELECT id, name, department_id, most_id, is_lead, CASE WHEN most_id != '' THEN most_id ELSE (
		SELECT most_id FROM employee WHERE department_id=e.department_id AND is_lead
	) END
	FROM public.employee AS e;

получение списка

	SELECT i.id, i.name, factory_number, v.date, v.next_date, m.person_id, m.department_id, e.name AS person, d.name AS department
	FROM public.instruments AS i
	LEFT JOIN LATERAL (SELECT date, next_date FROM verification_history WHERE instrument_id=i.id ORDER BY date DESC LIMIT 1) AS v ON TRUE
	LEFT JOIN LATERAL (SELECT person_id, department_id, status FROM si_movement_history WHERE instrument_id=i.id ORDER BY date_of_issue DESC LIMIT 1) AS m ON TRUE
	LEFT JOIN employee AS e ON e.id=m.person_id
	LEFT JOIN departments AS d ON d.id=m.department_id
	WHERE next_date>1709146800 AND next_date<1711911600 AND m.status='used'

получение списка инструментов с держателем и most_id

SELECT i.id, i.name, factory_number, v.date, v.next_date, e.name AS person, d.name AS department,
	(CASE WHEN e.most_id != '' THEN e.most_id ELSE l.most_id END) AS most_id
	FROM public.instruments AS i
	LEFT JOIN LATERAL (SELECT date, next_date FROM verification_history WHERE instrument_id=i.id ORDER BY date DESC LIMIT 1) AS v ON TRUE
	LEFT JOIN LATERAL (SELECT person_id, department_id, status FROM si_movement_history WHERE instrument_id=i.id ORDER BY date_of_issue DESC LIMIT 1) AS m ON TRUE
	LEFT JOIN employee AS e ON e.id=m.person_id
	LEFT JOIN departments AS d ON d.id=m.department_id
	LEFT JOIN LATERAL (SELECT most_id FROM employee WHERE department_id=m.department_id AND is_lead=true) AS l ON true
	WHERE m.status='used' AND next_date>1709146800 AND next_date<1711911600
	ORDER BY most_id, next_date
*/
