package http

import (
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	httpV1 "github.com/Alexander272/si_accounting/backend/internal/transport/http/v1"
	"github.com/Alexander272/si_accounting/backend/pkg/limiter"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	// permissions casbin.Casbin
	// keycloak *auth.KeycloakClient
	services *services.Services
}

func NewHandler(services *services.Services) *Handler {
	return &Handler{
		services: services,
		// permissions: permissions,
		// keycloak: keycloak,
	}
}

func (h *Handler) Init(conf *config.Config) *gin.Engine {
	router := gin.Default()

	router.Use(
		limiter.Limit(conf.Limiter.RPS, conf.Limiter.Burst, conf.Limiter.TTL),
	)

	router.Use(
		// static.Serve("/", static.LocalFile("../frontend/dist/", true)),
		limiter.Limit(conf.Limiter.RPS, conf.Limiter.Burst, conf.Limiter.TTL),
	)

	// Init router
	router.GET("/api/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	h.initAPI(router, conf.Auth, conf.Bot)

	return router
}

func (h *Handler) initAPI(router *gin.Engine, auth config.AuthConfig, bot config.BotConfig) {
	// handlerV1 := httpV1.NewHandler(h.services, auth, bot, middleware.NewMiddleware(h.services, auth, h.permissions, h.keycloak))
	handlerV1 := httpV1.NewHandler(h.services)
	api := router.Group("/api")
	{
		handlerV1.Init(api)
	}
}
