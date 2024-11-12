package v1

import (
	"github.com/Alexander272/si_accounting/backend/internal/config"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/middleware"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/auth"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/channel"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/departments"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/employees"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/file"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/filter"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/responsible"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/roles"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/instrument"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/location"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/receiving"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/verification"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/user"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	services   *services.Services
	conf       *config.Config
	middleware *middleware.Middleware
}

type Deps struct {
	Services   *services.Services
	Conf       *config.Config
	Middleware *middleware.Middleware
}

func NewHandler(deps Deps) *Handler {
	return &Handler{
		services:   deps.Services,
		conf:       deps.Conf,
		middleware: deps.Middleware,
	}
}

func (h *Handler) Init(group *gin.RouterGroup) {
	// TODO что осталось сделать:
	// + добавить кнопочку что не нужны уведомления (при выдаче инструмента, чтобы избавиться от подтверждения и перемещения)
	// + если подтверждение пользователю не приходит, то вернуть он его не может => метролог должна сама выполнять возврат => мне нужно добавить форму и api
	// +- надо запрещать добавлять перемещение если инструмент не в резерве (на сервере нет проверок, блокировка идет только на клиенте)
	// + отправлять уведомления о необходимости сдачи инструментов (должно быть несколько уведомлений друг за другом через определенные промежутки времени или в конкретные даты. лучше сделать так чтобы можно было задать любое кол-во с определенным временем)
	// + отправлять уведомления о выдаче инструмента
	// - [сделать возможность уведомления через почту или мост [или и то, и то]]
	// + добавить возможность для редактора добавлять и изменять пользователей и подразделения
	// + [сделать для бота возможность подтверждения получения инструментов прямо в нем (не переходя в сервис)]
	// + сделать авторизацию в сервисе
	// + защитить необходимые api
	// + разделить функционал на клиенте по ролям
	// + сделать фильтры по умолчанию для ролей (или для конкретных пользователей) ? создал фильтры для пользователей в отдельной таблице |>
	// + добавить страницы с историями (возможно модальные окна) + надо добавить возможность просмотра файлов (скачивания)
	// - сделать страницу с настройками прав доступа (для админа)
	// + сделать создание графиков поверки
	// - [надо бы еще сделать уведомления о просроченной поверке инструментов] (надо уточнить надо ли это вообще)
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

	v1 := group.Group("/v1")

	auth.Register(v1, auth.Deps{Service: h.services.Session, Auth: h.conf.Auth})

	secure := v1.Group("", h.middleware.VerifyToken)

	siGroup := secure.Group("/si")
	si.Register(siGroup, h.services.SI, h.middleware)
	instrument.Register(siGroup, h.services.Instrument, h.middleware)
	verification.Register(siGroup, h.services.Verification, h.services.Documents, h.middleware)
	location.Register(siGroup, h.services.Location, h.middleware)
	receiving.Register(v1, h.services.Location, h.middleware)
	filter.Register(secure, h.services.DefaultFilter, h.middleware)

	file.Register(secure, h.services.File, h.middleware)

	departments.Register(secure, h.services.Department, h.middleware)
	employees.Register(secure, h.services.Employee, h.middleware)
	channel.Register(secure, h.services.Channel, h.middleware)

	user.Register(secure, h.services.User, h.middleware)
	responsible.Register(secure, h.services.Responsible, h.middleware)

	roles.Register(secure, h.services.Role, h.middleware)
	// menu.Register(secure, h.services.Menu, h.middleware)
	// menu_item.Register(secure, h.services.MenuItem, h.middleware)
}
