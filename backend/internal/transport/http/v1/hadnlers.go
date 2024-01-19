package v1

import (
	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/middleware"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/auth"
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

type Handler struct {
	services   *services.Services
	conf       *config.Config
	middleware *middleware.Middleware
	cookieName string
}

type Deps struct {
	Services   *services.Services
	Conf       *config.Config
	Middleware *middleware.Middleware
	CookieName string
}

func NewHandler(deps Deps) *Handler {
	return &Handler{
		services:   deps.Services,
		conf:       deps.Conf,
		middleware: deps.Middleware,
		cookieName: deps.CookieName,
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
	// + добавить возможность для редактора добавлять и изменять пользователей и подразделения
	// - сделать для бота возможность подтверждения получения инструментов прямо в нем (не переходя в сервис)
	// - сделать авторизацию в сервисе
	// - разделить функционал на клиенте по ролям
	// - сделать фильтры по умолчанию для ролей (или для конкретных пользователей)
	// - добавить страницы с историями (возможно модальные окна)
	// - сделать страницу с настройками прав доступа (для админа)
	// - сделать возможность скрывать колонки в таблице
	// -

	auth.Register(v1, auth.Deps{Service: h.services.Session, Auth: h.conf.Auth, CookieName: h.cookieName})

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
