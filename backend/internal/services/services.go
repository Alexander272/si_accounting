package services

import (
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/repository"
	"github.com/Alexander272/si_accounting/backend/pkg/auth"
)

type Services struct {
	Instrument
	Verification
	Documents
	Location
	SI
	Department
	Employee
	Role
	DefaultFilter

	ApiPaths
	MenuItem
	MenuWithApi
	Menu

	Session
	Permission

	ErrorBot
	Notification
}

type Deps struct {
	Repos           *repository.Repository
	Keycloak        *auth.KeycloakClient
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
	BotUrl          string
	ErrorBotUrl     string
}

func NewServices(deps Deps) *Services {
	errorBot := NewErrorBotService(deps.ErrorBotUrl)
	most := NewMostService(deps.BotUrl)

	department := NewDepartmentService(deps.Repos.Department)
	employee := NewEmployeeService(deps.Repos.Employee)

	documents := NewDocumentsService(deps.Repos.Documents)
	instrument := NewInstrumentService(deps.Repos.Instrument, documents)
	verification := NewVerificationService(deps.Repos.Verification, documents, instrument)
	location := NewLocationService(deps.Repos.Location, employee, most)

	si := NewSIService(deps.Repos.SI, instrument, verification, location)

	filter := NewDefaultFilterService(deps.Repos.DefaultFilter)

	role := NewRoleService(deps.Repos.Role)
	api := NewApiPathsService(deps.Repos.ApiPaths)
	menuItem := NewMenuItemService(deps.Repos.MenuItem)
	menuWithApi := NewMenuWithApiService(deps.Repos.MenuWithApi)
	menu := NewMenuService(deps.Repos.Menu, menuWithApi)

	// TODO можно включить для keycloak настройку что он за прокси и запустить сервер на 80 (или на другом) порту для вывода интерфейса
	// TODO при авторизации пользователя его можно искать сразу по нескольким realm
	session := NewSessionService(deps.Keycloak, role, filter)

	// TODO для чего я делаю экземпляр ботов для каждого сервиса, когда нужно запустить один и отправлять все запросы на него. тоже самое относится и сервису email, файловому (file - minio) и возможно к некоторым другим. можно в принципе сделать один сервис бота для ошибок и рассылок (стоит рассмотреть и попробовать. можно попробовать связать шаблон и формат данных, а еще бота от имени которого будет отправляться сообщение)

	permission := NewPermissionService("configs/privacy.conf", menu)

	notification := NewNotificationService(si, most, errorBot)

	return &Services{
		Instrument:    instrument,
		Verification:  verification,
		Documents:     documents,
		Location:      location,
		SI:            si,
		Department:    department,
		Employee:      employee,
		Role:          role,
		DefaultFilter: filter,

		ApiPaths:    api,
		MenuItem:    menuItem,
		MenuWithApi: menuWithApi,
		Menu:        menu,

		Session:    session,
		Permission: permission,

		ErrorBot:     errorBot,
		Notification: notification,
	}
}
