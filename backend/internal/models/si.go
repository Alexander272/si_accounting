package models

type SIParams struct {
	Page   SIPage
	Sort   SISort   `json:"sort"`
	Filter SIFilter `json:"filter"`
}

type SIPage struct {
	Limit  int
	Offset int
}

type SISort struct {
	Field string `json:"field"`
	Type  string `json:"type"`
}

type SIFilter struct {
	Field       string   `json:"field"`
	FieldType   string   `json:"fieldType"`
	CompareType string   `json:"compareType"`
	Values      []string `json:"values"`
}

type Period struct {
	StartAt  string
	FinishAt string
}

type SIList struct {
	Total int  `json:"total" db:"total"`
	SI    []SI `json:"si"`
}

type SI struct {
	Id                        string `json:"id" db:"id"`
	Name                      string `json:"name" db:"name"`
	Type                      string `json:"type" db:"type"`
	FactoryNumber             string `json:"factoryNumber" db:"factory_number"`
	MeasurementLimits         string `json:"measurementLimits" db:"measurement_limits"`
	Accuracy                  string `json:"accuracy" db:"accuracy"`
	StateRegister             string `json:"stateRegister" db:"state_register"`
	Manufacturer              string `json:"manufacturer" db:"manufacturer"`
	YearOfIssue               string `json:"yearOfIssue" db:"year_of_issue"`
	InterVerificationInterval string `json:"interVerificationInterval" db:"inter_verification_interval"`
	Notes                     string `json:"notes" db:"notes"`
	Date                      string `json:"verificationDate" db:"date"`
	NextDate                  string `json:"nextVerificationDate" db:"next_date"`
	Place                     string `json:"place" db:"place"`
	Status                    string `json:"status" db:"status"`
	Total                     int    `json:"-" db:"total_count"`
}

type SIFromNotification struct {
	Id            string `db:"id"`
	Name          string `db:"name"`
	FactoryNumber string `db:"factory_number"`
	Date          string `db:"date"`
	NextDate      string `db:"next_date"`
	Person        string `db:"person"`
	Department    string `db:"department"`
	MostId        string `db:"most_id"`
}
