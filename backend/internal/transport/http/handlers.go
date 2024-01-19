package http

import (
	"context"
	"fmt"
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	httpV1 "github.com/Alexander272/si_accounting/backend/internal/transport/http/v1"
	"github.com/Alexander272/si_accounting/backend/pkg/limiter"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

const CookieName = "si_accounting_session"

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

	// Init router
	router.GET("/api/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	h.initAPI(router, conf)

	return router
}

func (h *Handler) initAPI(router *gin.Engine, conf *config.Config) {
	// handlerV1 := httpV1.NewHandler(h.services, auth, bot, middleware.NewMiddleware(h.services, auth, h.permissions, h.keycloak))

	//TODO add middleware
	handlerV1 := httpV1.NewHandler(httpV1.Deps{Services: h.services, Conf: conf, CookieName: CookieName})
	api := router.Group("/api")
	{
		handlerV1.Init(api)
	}

	allPaths := make(map[string]models.ApiDTO)
	routes := router.Routes()
	for _, v := range routes {
		if v.Path != "/api/ping" {
			allPaths[fmt.Sprintf("%s:%s", v.Path, v.Method)] = models.ApiDTO{
				Path:   v.Path,
				Method: v.Method,
			}
		}
	}
	if err := h.services.ApiPaths.Load(context.Background(), allPaths); err != nil {
		logger.Error("failed to load api paths. error: ", err.Error())
	}
}
