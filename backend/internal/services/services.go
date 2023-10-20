package services

import (
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/repository"
	"github.com/Alexander272/si_accounting/backend/pkg/auth"
)

type Services struct {
}

type Deps struct {
	Repos           *repository.Repository
	Keycloak        *auth.KeycloakClient
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
}

func NewServices() *Services {
	return &Services{}
}
