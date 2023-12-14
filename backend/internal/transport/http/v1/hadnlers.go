package v1

import (
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/departments"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/instrument"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/location"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/verification"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/users"
	"github.com/gin-gonic/gin"
)

const CookieName = "si_accounting_session"

type Handler struct {
	services *services.Services
	// auth     config.AuthConfig
	// bot      config.BotConfig
	// middleware *middleware.Middleware
	cookieName string
}

// func NewHandler(services *services.Services, auth config.AuthConfig, bot config.BotConfig, middleware *middleware.Middleware) *Handler {
func NewHandler(services *services.Services) *Handler {
	// middleware.CookieName = CookieName

	return &Handler{
		services: services,
		// auth:       auth,
		// bot:        bot,
		// middleware: middleware,
		cookieName: CookieName,
	}
}

func (h *Handler) Init(group *gin.RouterGroup) {
	v1 := group.Group("/v1")
	{
		v1.GET("/", h.notImplemented)
	}

	// botApi := api.NewMostApi(h.bot.Url)

	// auth.Register(v1, h.services.Session, h.auth, botApi, h.cookieName)

	siGroup := v1.Group("/si")
	si.Register(siGroup, h.services.SI)
	instrument.Register(siGroup, h.services.Instrument)
	verification.Register(siGroup, h.services.Verification, h.services.Documents)
	location.Register(siGroup, h.services.Location)

	departments.Register(v1, h.services.Department)
	users.Register(v1, h.services.User)

	// 	criterionsGroup := v1.Group("/criterions", h.middleware.VerifyToken, h.middleware.CheckPermissions)
	// 	criterions.Register(criterionsGroup, h.services.Criterions, botApi)
	// 	complete.Register(criterionsGroup, h.services.CompleteCriterion, botApi)

	// output_volume.Register(criterionsGroup, h.services.OutputVolume, botApi)
	// shipment_plan.Register(criterionsGroup, h.services.ShipmentPlan, botApi)
	// orders_volume.Register(criterionsGroup, h.services.OrdersVolume, botApi)
	// production_load.Register(criterionsGroup, h.services.ProductionLoad, botApi)
	// production_plan.Register(criterionsGroup, h.services.ProductionPlan, botApi)
}

func (h *Handler) notImplemented(c *gin.Context) {
	response.NewErrorResponse(c, http.StatusInternalServerError, "not implemented", "not implemented")
}
