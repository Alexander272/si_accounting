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
	db           *sqlx.DB
	formatFields map[string]string
}

func NewSIRepo(db *sqlx.DB) *SIRepo {
	format := make(map[string]string)

	format["name"] = "name"
	format["type"] = "type"
	format["factoryNumber"] = "factory_number"
	format["measurementLimits"] = "measurement_limits"
	format["accuracy"] = "accuracy"
	format["stateRegister"] = "state_register"
	format["manufacturer"] = "manufacturer"
	format["yearOfIssue"] = "year_of_issue"
	format["interVerificationInterval"] = "inter_verification_interval"
	format["notes"] = "notes"
	format["verificationDate"] = "date"
	format["nextVerificationDate"] = "next_date"
	// format["place"] = "department_id"
	format["department"] = "department_id"
	format["place"] = "place"
	format["person"] = "person"
	format["status"] = "m.status"

	return &SIRepo{
		db:           db,
		formatFields: format,
	}
}

type SI interface {
	GetAll(context.Context, *models.SIParams) (*models.SIList, error)
	GetMoved(context.Context, *models.SIParams) (*models.SIList, error)
	GetForNotification(context.Context, *models.Period) ([]*models.Notification, error)
	GetForVerification(context.Context, *models.Period) ([]*models.Notification, error)
}

func (r *SIRepo) GetAll(ctx context.Context, req *models.SIParams) (*models.SIList, error) {
	list := &models.SIList{}

	params := []interface{}{req.RealmId, req.Status}
	count := len(params) + 1

	order := " ORDER BY "
	for _, s := range req.Sort {
		order += fmt.Sprintf("%s %s, ", r.formatFields[s.Field], s.Type)
	}
	order += "created_at, id"

	filter := ""
	for _, ns := range req.Filters {
		if ns.Field == "department" {
			filter += " AND (" + getFilterLine(ns.Values[0].CompareType, r.formatFields[ns.Field], count) + " OR (" +
				getFilterLine(ns.Values[0].CompareType, "last_place_id", count) + "AND m.status='moved'))"

			ns.Values[0].Value = strings.ReplaceAll(ns.Values[0].Value, ",", "|")
			params = append(params, ns.Values[0].Value)
			count++
			continue
		}
		for _, sv := range ns.Values {
			filter += " AND " + getFilterLine(sv.CompareType, r.formatFields[ns.Field], count)
			if sv.CompareType == "in" {
				sv.Value = strings.ReplaceAll(sv.Value, ",", "|")
			}
			params = append(params, sv.Value)
			count++
		}
	}

	params = append(params, req.Page.Limit, req.Page.Offset)

	query := fmt.Sprintf(`SELECT id, name, type, factory_number, measurement_limits, accuracy, state_register, manufacturer, year_of_issue, 
		inter_verification_interval, notes, m.status, v.date, v.next_date, COALESCE(m.place,'') AS place, COALESCE(m.person,'') AS person, 
		COALESCE(m.last_place,'') AS last_place, COUNT(*) OVER() AS total_count
		FROM %s AS i
		LEFT JOIN LATERAL (SELECT date, next_date FROM %s WHERE instrument_id=i.id ORDER BY date DESC, created_at DESC LIMIT 1) AS v ON TRUE
		LEFT JOIN LATERAL (SELECT (CASE WHEN status='%s' THEN place WHEN status='%s' THEN 'Резерв' ELSE
			(CASE WHEN last_place!='' THEN 'Перемещение из «'||last_place||'»' ELSE 'Перемещение' END) END) AS place, last_place, last_place_id, status,
			person, department_id FROM %s WHERE instrument_id=i.id ORDER BY date_of_issue DESC, created_at DESC LIMIT 1) AS m ON TRUE
		WHERE realm_id=$1 AND i.status=$2%s%s LIMIT $%d OFFSET $%d`,
		InstrumentTable, VerificationTable, constants.LocationStatusUsed, constants.LocationStatusReserve, SIMovementTable,
		filter, order, count, count+1,
	)

	// logger.Debug(query)

	if err := r.db.SelectContext(ctx, &list.SI, query, params...); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	for i, s := range list.SI {
		date, err := strconv.ParseInt(s.Date, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse date. error: %w", err)
		}
		list.SI[i].Date = ""
		if date > 0 {
			list.SI[i].Date = time.Unix(date, 0).Format(constants.DateFormat)
		}

		nextDate, err := strconv.ParseInt(s.NextDate, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse date. error: %w", err)
		}
		list.SI[i].NextDate = ""
		if nextDate > 0 {
			list.SI[i].NextDate = time.Unix(nextDate, 0).Format(constants.DateFormat)
		}
	}

	if len(list.SI) > 0 {
		list.Total = list.SI[0].Total
	} else {
		list.SI = []*models.SI{}
	}

	return list, nil
}

func (r *SIRepo) GetMoved(ctx context.Context, req *models.SIParams) (*models.SIList, error) {
	// для метролога фильтр по подразделению будет ComType null, для других пользователей ComType in

	// еще нужно при получении данных о пользователе смотреть в каких подразделениях он лидер, либо я могу запрашивать эти данные при открытии окна
	// тогда можно на клиенте показывать список подразделений где по умолчанию будут отмечены, те где он лидер
	// а ниже список инструментов сгруппированных по подразделениям и кнопка для подтверждения получения

	params := []interface{}{constants.LocationStatusMoved}
	filter := ""
	count := 2
	for _, f := range req.Filters {
		for _, sv := range f.Values {
			filter += " AND " + getFilterLine(sv.CompareType, r.formatFields[f.Field], count)
			if sv.CompareType == "in" {
				sv.Value = strings.ReplaceAll(sv.Value, ",", "|")
			}
			if sv.CompareType != "null" {
				params = append(params, sv.Value)
				count++
			}
		}
	}

	query := fmt.Sprintf(`SELECT id, name, factory_number, v.date, v.next_date, COALESCE(m.place,'') AS place, COALESCE(m.person,'') AS person, 
		COALESCE(m.last_place,'') AS last_place
		FROM %s AS i
		LEFT JOIN LATERAL (SELECT date, next_date FROM %s WHERE instrument_id=i.id ORDER BY date DESC, created_at DESC LIMIT 1) AS v ON TRUE
		LEFT JOIN LATERAL (SELECT place, person, last_place, department_id, status FROM %s WHERE instrument_id=i.id 
			ORDER BY date_of_issue DESC, created_at DESC LIMIT 1) AS m ON TRUE
		WHERE m.status=$1 %s ORDER BY place, last_place`,
		InstrumentTable, VerificationTable, SIMovementTable, filter,
	)
	data := []*models.SI{}

	if err := r.db.SelectContext(ctx, &data, query, params...); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	list := &models.SIList{
		SI:    data,
		Total: len(data),
	}
	return list, nil
}

func (r *SIRepo) GetForNotification(ctx context.Context, req *models.Period) (nots []*models.Notification, err error) {

	periodCond := ""
	status := constants.LocationStatusMoved
	notType := "receiving"
	params := []interface{}{status}
	if req.StartAt != 0 {
		status = constants.LocationStatusUsed
		periodCond = "AND next_date>=$2 AND next_date<=$3"
		notType = ""
		params = []interface{}{status, req.StartAt, req.FinishAt}
	}

	data := []*models.SIFromNotification{}
	// query := fmt.Sprintf(`SELECT i.id, i.name, factory_number, v.date, v.next_date, COALESCE(e.name, '') AS person, COALESCE(d.name, '') AS department,
	// 	COALESCE(CASE WHEN e.most_id != '' THEN e.most_id ELSE l.most_id END, '') AS most_id,
	// 	COALESCE(CASE WHEN e.most_id != '' THEN '' ELSE l.channel_id END, '') AS channel_id
	// 	FROM %s AS i
	// 	LEFT JOIN LATERAL (SELECT date, next_date FROM %s WHERE instrument_id=i.id ORDER BY date DESC, created_at DESC LIMIT 1) AS v ON TRUE
	// 	LEFT JOIN LATERAL (SELECT person_id, department_id, status FROM %s WHERE instrument_id=i.id
	// 		ORDER BY date_of_issue DESC, created_at DESC LIMIT 1) AS m ON TRUE
	// 	LEFT JOIN %s AS e ON e.id=m.person_id
	// 	LEFT JOIN %s AS d ON d.id=m.department_id
	// 	LEFT JOIN LATERAL (SELECT most_id, channel_id FROM %s WHERE department_id=m.department_id AND is_lead=true LIMIT 1) AS l ON true
	// 	WHERE m.status=$1 %s
	// 	ORDER BY most_id, channel_id, department, next_date`,
	// 	InstrumentTable, VerificationTable, SIMovementTable, EmployeeTable, DepartmentTable, EmployeeTable, periodCond,
	// )
	query := fmt.Sprintf(`SELECT i.id, i.name, factory_number, v.date, v.next_date, COALESCE(e.name, '') AS person, COALESCE(d.name, '') AS department,
		COALESCE(most_id, '') AS most_id, COALESCE(most_channel_id, '') AS channel_id
		FROM %s AS i
		LEFT JOIN LATERAL (SELECT date, next_date FROM %s WHERE instrument_id=i.id ORDER BY date DESC, created_at DESC LIMIT 1) AS v ON TRUE
		LEFT JOIN LATERAL (SELECT person_id, department_id, status FROM %s WHERE instrument_id=i.id 
			ORDER BY date_of_issue DESC, created_at DESC LIMIT 1) AS m ON TRUE
		LEFT JOIN %s AS e ON e.id=m.person_id
		LEFT JOIN %s AS d ON d.id=m.department_id
		LEFT JOIN LATERAL (SELECT most_channel_id FROM %s WHERE id=d.channel_id) AS c ON TRUE
		WHERE m.status=$1 %s
		ORDER BY most_id, channel_id, department, next_date`,
		InstrumentTable, VerificationTable, SIMovementTable, EmployeeTable, DepartmentTable, ChannelTable, periodCond,
	)

	// if req.StartAt != "" {
	// 	startAt, err := time.Parse(constants.DateFormat, req.StartAt)
	// 	if err != nil {
	// 		return nil, fmt.Errorf("failed to parse start date. error: %w", err)
	// 	}
	// 	finishAt, err := time.Parse(constants.DateFormat, req.FinishAt)
	// 	if err != nil {
	// 		return nil, fmt.Errorf("failed to parse finish date. error: %w", err)
	// 	}

	// 	params = append(params, startAt.Unix(), finishAt.Unix())
	// }

	if err := r.db.SelectContext(ctx, &data, query, params...); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	for i, sn := range data {
		si := &models.SelectedSI{
			Id:            sn.Id,
			Name:          sn.Name,
			Department:    sn.Department,
			FactoryNumber: sn.FactoryNumber,
			Person:        sn.Person,
		}

		notStatus := constants.LocationStatusUsed
		if sn.Person == "" && sn.Department == "" && sn.MostId == "" && sn.ChannelId == "" {
			sn.MostId = constants.ReserveChannelId
			sn.ChannelId = constants.ReserveChannelId
			notStatus = constants.LocationStatusReserve
		}

		notEqualDeps := len(nots) > 0 && len(nots[len(nots)-1].SI) > 0 && nots[len(nots)-1].SI[0].Department != sn.Department
		if i == 0 || nots[len(nots)-1].MostId != sn.MostId || nots[len(nots)-1].ChannelId != sn.ChannelId || notEqualDeps {
			nots = append(nots, &models.Notification{
				MostId:    sn.MostId,
				ChannelId: sn.ChannelId,
				Type:      notType,
				Status:    notStatus,
				SI:        []*models.SelectedSI{si},
			})
		} else {
			nots[len(nots)-1].SI = append(nots[len(nots)-1].SI, si)
		}
	}

	return nots, nil
}

func (r *SIRepo) GetForVerification(ctx context.Context, req *models.Period) ([]*models.Notification, error) {
	query := fmt.Sprintf(`SELECT i.id, i.name, factory_number, date, next_date, reserve_channel AS channel_id
		FROM %s AS i
		LEFT JOIN %s AS r ON r.id=realm_id
		LEFT JOIN LATERAL (SELECT date, next_date FROM %s WHERE instrument_id=i.id 
			ORDER BY date DESC, created_at DESC LIMIT 1) AS v ON TRUE
		WHERE is_active=true AND expiration_notice=true AND reserve_channel!='' AND next_date>=$1 AND next_date<=$2`,
		InstrumentTable, RealmTable, VerificationTable,
	)
	data := []*models.SIFromNotification{}

	if err := r.db.SelectContext(ctx, &data, query, req.StartAt, req.FinishAt); err != nil {
		return nil, fmt.Errorf("failed to execute query. error: %w", err)
	}

	nots := []*models.Notification{}
	for i, sn := range data {
		si := &models.SelectedSI{
			Id:            sn.Id,
			Name:          sn.Name,
			FactoryNumber: sn.FactoryNumber,
		}
		if i == 0 || nots[len(nots)-1].ChannelId != sn.ChannelId {
			nots = append(nots, &models.Notification{
				ChannelId: sn.ChannelId,
				Type:      "notification",
				Status:    "notification",
				SI:        []*models.SelectedSI{si},
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
