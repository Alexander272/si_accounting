package pq_models

type LocationData struct {
	Id              string `db:"id"`
	InstrumentId    string `db:"instrument_id"`
	Place           string `db:"place"`
	PersonId        string `db:"person_id"`
	DepartmentId    string `db:"department_id"`
	DateOfIssue     int64  `db:"date_of_issue"`
	DateOfReceiving int64  `db:"date_of_receiving"`
	NeedConfirmed   bool   `db:"need_confirmed"`
	Status          string `db:"status"`
}
