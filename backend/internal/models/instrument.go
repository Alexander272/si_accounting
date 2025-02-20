package models

type Instrument struct {
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
	Status                    string `json:"status" db:"status"`
}

type CreateInstrumentDTO struct {
	RealmId                   string `json:"realmId" db:"realm_id" binding:"required"`
	Name                      string `json:"name" db:"name" binding:"required"`
	Type                      string `json:"type" db:"type"`
	FactoryNumber             string `json:"factoryNumber" db:"factory_number"`
	MeasurementLimits         string `json:"measurementLimits" db:"measurement_limits"`
	Accuracy                  string `json:"accuracy" db:"accuracy"`
	StateRegister             string `json:"stateRegister" db:"state_register"`
	Manufacturer              string `json:"manufacturer" db:"manufacturer"`
	YearOfIssue               string `json:"yearOfIssue" db:"year_of_issue" binding:"required"`
	InterVerificationInterval string `json:"interVerificationInterval" db:"inter_verification_interval"`
	Notes                     string `json:"notes" db:"notes"`
}

type UpdateInstrumentDTO struct {
	Id                        string `json:"id" binding:"required"`
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
}

type UpdateStatus struct {
	Id     string `json:"id" binding:"required"`
	Status string `json:"status"`
}

type GetInstrumentsDTO struct {
	IDs []string `json:"ids"`
}
