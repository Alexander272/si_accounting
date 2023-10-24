package models

type SIParams struct {
	Sort SiSort `json:"sort"`
}

type SiSort struct {
	Field string `json:"field"`
	Type  string `json:"type"`
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
}
