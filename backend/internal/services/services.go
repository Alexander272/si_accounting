package services

import (
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/models"
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
	Channel
	DefaultFilter
	File

	Role
	MenuItem
	Menu

	User
	Responsible

	Session
	Permission

	SINotification
	Scheduler
}

type Deps struct {
	Repos           *repository.Repository
	Keycloak        *auth.KeycloakClient
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
	BotUrl          string
	Times           []*models.NotificationTime
}

func NewServices(deps Deps) *Services {
	// errorBot := NewErrorBotService()
	most := NewMostService(deps.BotUrl)

	user := NewUserService(deps.Repos.User, deps.Keycloak)
	responsible := NewResponsibleService(deps.Repos.Responsible)

	documents := NewDocumentsService(deps.Repos.Documents)
	instrument := NewInstrumentService(deps.Repos.Instrument, documents)
	verification := NewVerificationService(deps.Repos.Verification, documents, instrument)
	// location := NewLocationService(deps.Repos.Location, NewEmployeeService(deps.Repos.Employee, nil), most)
	location := NewLocationService(&LocationDeps{
		Repo:        deps.Repos.Location,
		Most:        most,
		Responsible: responsible,
		Department:  NewDepartmentService(deps.Repos.Department, nil),
	})

	department := NewDepartmentService(deps.Repos.Department, location)
	employee := NewEmployeeService(deps.Repos.Employee, location)
	channel := NewChannelService(deps.Repos.Channel)

	si := NewSIService(deps.Repos.SI, instrument, verification, location)

	filter := NewDefaultFilterService(deps.Repos.DefaultFilter)

	file := NewFileService(si)

	role := NewRoleService(deps.Repos.Role)
	menuItem := NewMenuItemService(deps.Repos.MenuItem)
	menu := NewMenuService(deps.Repos.Menu, menuItem)

	// TODO можно включить для keycloak настройку что он за прокси и запустить сервер на 80 (или на другом) порту для вывода интерфейса
	// TODO при авторизации пользователя его можно искать сразу по нескольким realm
	session := NewSessionService(deps.Keycloak, role, filter)

	// TODO для чего я делаю экземпляр ботов для каждого сервиса, когда нужно запустить один и отправлять все запросы на него. тоже самое относится и сервису email, файловому (file - minio) и возможно к некоторым другим. можно в принципе сделать один сервис бота для ошибок и рассылок (стоит рассмотреть и попробовать. можно попробовать связать шаблон и формат данных, а еще бота от имени которого будет отправляться сообщение)

	permission := NewPermissionService("configs/privacy.conf", menu, role)

	// notification := NewNotificationService(si, most)
	si_notification := NewSINotificationService(si, most, deps.Times)
	scheduler := NewSchedulerService(&SchedulerDeps{Notification: si_notification, User: user})

	return &Services{
		Instrument:    instrument,
		Verification:  verification,
		Documents:     documents,
		Location:      location,
		SI:            si,
		Department:    department,
		Employee:      employee,
		Channel:       channel,
		DefaultFilter: filter,
		File:          file,

		Role:     role,
		MenuItem: menuItem,
		Menu:     menu,

		User:        user,
		Responsible: responsible,

		Session:    session,
		Permission: permission,

		// ErrorBot:     errorBot,
		// Notification:   notification,
		SINotification: si_notification,
		Scheduler:      scheduler,
	}
}
