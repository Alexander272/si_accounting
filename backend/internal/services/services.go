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
	department := NewDepartmentService(deps.Repos.Department)
	employee := NewEmployeeService(deps.Repos.Employee)

	instrument := NewInstrumentService(deps.Repos.Instrument)
	documents := NewDocumentsService(deps.Repos.Documents)
	verification := NewVerificationService(deps.Repos.Verification, documents, instrument)
	location := NewLocationService(deps.Repos.Location, employee)

	si := NewSIService(deps.Repos.SI, instrument, verification, location)

	role := NewRoleService(deps.Repos.Role)
	api := NewApiPathsService(deps.Repos.ApiPaths)
	menuItem := NewMenuItemService(deps.Repos.MenuItem)
	menuWithApi := NewMenuWithApiService(deps.Repos.MenuWithApi)
	menu := NewMenuService(deps.Repos.Menu, menuWithApi)

	session := NewSessionService(deps.Keycloak, role)
	permission := NewPermissionService("configs/privacy.conf", menu)

	errorBot := NewErrorBotService(deps.ErrorBotUrl)
	most := NewMostService(deps.BotUrl)
	notification := NewNotificationService(si, most, errorBot)

	return &Services{
		Instrument:   instrument,
		Verification: verification,
		Documents:    documents,
		Location:     location,
		SI:           si,
		Department:   department,
		Employee:     employee,
		Role:         role,
		ApiPaths:     api,
		MenuItem:     menuItem,
		MenuWithApi:  menuWithApi,
		Menu:         menu,
		Session:      session,
		Permission:   permission,

		ErrorBot:     errorBot,
		Notification: notification,
	}
}
