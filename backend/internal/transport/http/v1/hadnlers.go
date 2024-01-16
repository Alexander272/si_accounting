package v1

import (
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/departments"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/employees"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/menu"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/menu_item"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/menu_with_api"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/roles"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/instrument"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/location"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/verification"
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
	// {
	// 	v1.GET("/", h.notImplemented)
	// }

	// botApi := api.NewMostApi(h.bot.Url)

	// auth.Register(v1, h.services.Session, h.auth, botApi, h.cookieName)

	// TODO что осталось сделать:
	// - отправлять уведомления о необходимости сдачи инструментов
	// - добавить возможность для редактора добавлять и изменять пользователей и подразделения
	// - сделать для бота возможность подтверждения получения инструментов прямо в нем (не переходя в сервис)
	// - сделать авторизацию в сервисе
	// - разделить функционал на клиенте по ролям
	// - сделать фильтры по умолчанию для ролей (или для конкретных пользователей)
	// - сделать возможность скрывать колонки в таблице
	// - добавить страницы с историями (возможно модальные окна)
	// -

	siGroup := v1.Group("/si")
	si.Register(siGroup, h.services.SI)
	instrument.Register(siGroup, h.services.Instrument)
	verification.Register(siGroup, h.services.Verification, h.services.Documents)
	location.Register(siGroup, h.services.Location)

	departments.Register(v1, h.services.Department)
	employees.Register(v1, h.services.Employee)

	roles.Register(v1, h.services.Role)
	menu.Register(v1, h.services.Menu)
	menu_item.Register(v1, h.services.MenuItem)
	menu_with_api.Register(v1, h.services.MenuWithApi)
}

// func (h *Handler) notImplemented(c *gin.Context) {
// 	response.NewErrorResponse(c, http.StatusInternalServerError, "not implemented", "not implemented")
// }
