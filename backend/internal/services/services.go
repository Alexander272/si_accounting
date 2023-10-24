package services

import (
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/repository"
	"github.com/Alexander272/si_accounting/backend/pkg/auth"
)

type Services struct {
	Instrument
	Verification
	Location
	SI
}

type Deps struct {
	Repos           *repository.Repository
	Keycloak        *auth.KeycloakClient
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
}

func NewServices(deps Deps) *Services {
	instrument := NewInstrumentService(deps.Repos.Instrument)
	verification := NewVerificationService(deps.Repos.Verification)
	location := NewLocationService(deps.Repos.Location)

	si := NewSIService(deps.Repos.SI, instrument, verification, location)

	return &Services{
		Instrument:   instrument,
		Verification: verification,
		Location:     location,
		SI:           si,
	}
}
