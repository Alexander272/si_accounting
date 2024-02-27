package v1

import (
	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/api/error_bot"
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
	// + добавить кнопочку что не нужны уведомления (при выдаче инструмента, чтобы избавиться от подтверждения и перемещения)
	// + если подтверждение пользователю не приходит, то вернуть он его не может => метролог должна сама выполнять возврат => мне нужно добавить форму и api
	// +- надо запрещать добавлять перемещение если инструмент не в резерве (на сервере нет проверок, блокировка идет только на клиенте)
	// +- отправлять уведомления о необходимости сдачи инструментов (должно быть несколько уведомлений друг за другом через определенные промежутки времени или в конкретные даты. лучше сделать так чтобы можно было задать любое кол-во с определенным временем)
	// - отправлять уведомления о выдаче инструмента
	// - [сделать возможность уведомления через почту или мост [или и то, и то]]
	// + добавить возможность для редактора добавлять и изменять пользователей и подразделения
	// - [сделать для бота возможность подтверждения получения инструментов прямо в нем (не переходя в сервис)]
	// + сделать авторизацию в сервисе
	// + защитить необходимые api
	// +- разделить функционал на клиенте по ролям
	// - сделать фильтры по умолчанию для ролей (или для конкретных пользователей) |>
	// - добавить страницы с историями (возможно модальные окна)
	// - сделать страницу с настройками прав доступа (для админа)
	// - сделать создание графиков поверки
	// - надо бы еще сделать уведомления о просроченной поверке инструментов
	// - [сделать возможность скрывать или менять порядок колонок в таблице]
	// - [сохранять настройки вывода (сколько строк выводится на страницу, какие столбцы и прочее подобное)]
	// + [сделать возможность нескольких одновременных сортировок]
	// - [перенести проверку токена из keycloak в программу]
	// - [сделать расшифровку токена локально, а не в keycloak]
	// -

	/*
		|> можно сделать чтобы если роль == user добавлялся фильтр по месту нахождения (только подразделение где пользователь работает, проблема в том что
		список сотрудников и пользователей никак не связаны между собой)
		также сам фильтр лучше прописать в бд. так будет проще менять в случае чего
	*/

	// errBot := error_bot.NewErrorBotApi(h.conf.ErrorBot.Url, h.conf.ErrorBot.ApiPath)
	errBot := error_bot.NewErrorBotApi(h.services.ErrorBot)

	auth.Register(v1, auth.Deps{Service: h.services.Session, Auth: h.conf.Auth, CookieName: h.cookieName, ErrBot: errBot})

	//TODO вернуть middleware
	// secure := v1.Group("", h.middleware.VerifyToken, h.middleware.CheckPermissions)
	secure := v1.Group("")

	siGroup := secure.Group("/si")
	si.Register(siGroup, h.services.SI, errBot)
	instrument.Register(siGroup, h.services.Instrument, errBot)
	verification.Register(siGroup, h.services.Verification, h.services.Documents, errBot)
	location.Register(siGroup, h.services.Location, errBot)

	departments.Register(secure, h.services.Department, errBot)
	employees.Register(secure, h.services.Employee, errBot)

	roles.Register(secure, h.services.Role, errBot)
	menu.Register(secure, h.services.Menu, errBot)
	menu_item.Register(secure, h.services.MenuItem, errBot)
	menu_with_api.Register(secure, h.services.MenuWithApi, errBot)
}

// func (h *Handler) notImplemented(c *gin.Context) {
// 	response.NewErrorResponse(c, http.StatusInternalServerError, "not implemented", "not implemented")
// }
