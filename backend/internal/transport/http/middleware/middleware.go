package middleware

import (
	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/pkg/auth"
	// "github.com/casbin/casbin/v2"
)

type Middleware struct {
	CookieName string
	// enforcer   casbin.IEnforcer
	permissions casbin.Casbin
	// TODO сделать Keycloak приватным
	Keycloak *auth.KeycloakClient
	// TODO стоит наверное получать не все сервисы, а только те что используются
	services *services.Services
	auth     config.AuthConfig
	CtxUser  string
	// CtxRole              string
}

func NewMiddleware(services *services.Services, auth config.AuthConfig, permissions casbin.Casbin, keycloak *auth.KeycloakClient) *Middleware {
	return &Middleware{
		// enforcer: enforcer,
		permissions: permissions,
		Keycloak:    keycloak,
		services:    services,
		auth:        auth,
		CtxUser:     "user_context",
		// UserIdCtx:            "userId",
		// RoleCtx:              "role",
	}
}
