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
	// - отправлять уведомления о необходимости сдачи инструментов (должно быть несколько уведомлений друг за другом через определенные промежутки времени или в конкретные даты. лучше сделать так чтобы можно было задать любое кол-во с определенным временем)
	// - [сделать возможность уведомления через почту или мост [или и то, и то]]
	// + добавить возможность для редактора добавлять и изменять пользователей и подразделения
	// - [сделать для бота возможность подтверждения получения инструментов прямо в нем (не переходя в сервис)]
	// + сделать авторизацию в сервисе
	// + защитить необходимые api
	// +- разделить функционал на клиенте по ролям
	// - сделать фильтры по умолчанию для ролей (или для конкретных пользователей) |>
	// - добавить страницы с историями (возможно модальные окна)
	// - сделать страницу с настройками прав доступа (для админа)
	// - [сделать возможность скрывать колонки в таблице]
	// - [сделать возможность нескольких одновременных сортировок]
	// - [перенести проверку токена из keycloak в программу]
	// - [сделать расшифровку токена локально, а не в keycloak]
	// -

	/*
		|> можно сделать чтобы если роль == user добавлялся фильтр по месту нахождения (только подразделение где пользователь работает, проблема в том что
		список сотрудников и пользователей никак не связаны между собой)
		также сам фильтр лучше прописать в бд. так будет проще менять в случае чего
	*/

	auth.Register(v1, auth.Deps{Service: h.services.Session, Auth: h.conf.Auth, CookieName: h.cookieName})

	secure := v1.Group("", h.middleware.VerifyToken, h.middleware.CheckPermissions)

	siGroup := secure.Group("/si")
	si.Register(siGroup, h.services.SI)
	instrument.Register(siGroup, h.services.Instrument)
	verification.Register(siGroup, h.services.Verification, h.services.Documents)
	location.Register(siGroup, h.services.Location)

	departments.Register(secure, h.services.Department)
	employees.Register(secure, h.services.Employee)

	roles.Register(secure, h.services.Role)
	menu.Register(secure, h.services.Menu)
	menu_item.Register(secure, h.services.MenuItem)
	menu_with_api.Register(secure, h.services.MenuWithApi)
}

// func (h *Handler) notImplemented(c *gin.Context) {
// 	response.NewErrorResponse(c, http.StatusInternalServerError, "not implemented", "not implemented")
// }
