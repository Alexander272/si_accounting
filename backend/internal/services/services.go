package services

import (
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/repository"
	"github.com/Alexander272/si_accounting/backend/pkg/auth"
)

type Services struct {
	Instrument
	Verification
	Documents
	Location
	SI
	Department
	Employee
}

type Deps struct {
	Repos           *repository.Repository
	Keycloak        *auth.KeycloakClient
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
}

func NewServices(deps Deps) *Services {
	instrument := NewInstrumentService(deps.Repos.Instrument)
	documents := NewDocumentsService(deps.Repos.Documents)
	verification := NewVerificationService(deps.Repos.Verification, documents, instrument)
	location := NewLocationService(deps.Repos.Location)

	si := NewSIService(deps.Repos.SI, instrument, verification, location)

	department := NewDepartmentService(deps.Repos.Department)
	employee := NewEmployeeService(deps.Repos.Employee)

	return &Services{
		Instrument:   instrument,
		Verification: verification,
		Documents:    documents,
		Location:     location,
		SI:           si,
		Department:   department,
		Employee:     employee,
	}
}
