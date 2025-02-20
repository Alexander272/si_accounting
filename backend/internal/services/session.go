package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/pkg/auth"
)

type SessionService struct {
	keycloak *auth.KeycloakClient
	role     Role
	filter   DefaultFilter
}

func NewSessionService(keycloak *auth.KeycloakClient, role Role, filter DefaultFilter) *SessionService {
	return &SessionService{
		keycloak: keycloak,
		role:     role,
		filter:   filter,
	}
}

type Session interface {
	SignIn(ctx context.Context, u models.SignIn) (*models.User, error)
	SignOut(ctx context.Context, refreshToken string) error
	Refresh(ctx context.Context, refreshToken string) (*models.User, error)
	DecodeAccessToken(ctx context.Context, token string) (*models.User, error)
}

func (s *SessionService) SignIn(ctx context.Context, u models.SignIn) (*models.User, error) {
	res, err := s.keycloak.Client.Login(ctx, s.keycloak.ClientId, s.keycloak.ClientSecret, s.keycloak.Realm, u.Username, u.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to login to keycloak. error: %w", err)
	}

	user, err := s.DecodeAccessToken(ctx, res.AccessToken)
	if err != nil {
		return nil, err
	}

	// get menu
	role, err := s.role.Get(ctx, user.Role)
	if err != nil {
		return nil, err
	}

	// get default filters
	filters, err := s.filter.Get(ctx, user.Id)
	if err != nil {
		return nil, err
	}

	user.AccessToken = res.AccessToken
	user.RefreshToken = res.RefreshToken
	user.Menu = role.Menu
	user.Filters = filters

	return user, nil
}

func (s *SessionService) SignOut(ctx context.Context, refreshToken string) error {
	err := s.keycloak.Client.Logout(ctx, s.keycloak.ClientId, s.keycloak.ClientSecret, s.keycloak.Realm, refreshToken)
	if err != nil {
		return fmt.Errorf("failed to logout to keycloak. error: %w", err)
	}
	return nil
}

func (s *SessionService) Refresh(ctx context.Context, refreshToken string) (*models.User, error) {
	res, err := s.keycloak.Client.RefreshToken(ctx, refreshToken, s.keycloak.ClientId, s.keycloak.ClientSecret, s.keycloak.Realm)
	if err != nil {
		return nil, fmt.Errorf("failed to refresh token in keycloak. error: %w", err)
	}

	user, err := s.DecodeAccessToken(ctx, res.AccessToken)
	if err != nil {
		return nil, err
	}

	// get menu
	role, err := s.role.Get(ctx, user.Role)
	if err != nil {
		return nil, err
	}

	// get default filters
	filters, err := s.filter.Get(ctx, user.Id)
	if err != nil {
		return nil, err
	}

	user.AccessToken = res.AccessToken
	user.RefreshToken = res.RefreshToken
	user.Menu = role.Menu
	user.Filters = filters

	return user, nil
}

func (s *SessionService) DecodeAccessToken(ctx context.Context, token string) (*models.User, error) {
	//TODO расшифровку токена тоже лучше делать здесь, а в keycloak
	_, claims, err := s.keycloak.Client.DecodeAccessToken(ctx, token, s.keycloak.Realm)
	if err != nil {
		return nil, fmt.Errorf("failed to decode access token. error: %w", err)
	}

	//TODO можно хранить текущие роли пользователя в redis используя sid в качестве ключа, а еще используя время жизни токена
	// либо же хранить роли в cookie

	user := &models.User{}
	var role, username, userId string
	c := *claims
	access, ok := c["realm_access"]
	if ok {
		a := access.(map[string]interface{})["roles"]
		roles := a.([]interface{})
		for _, r := range roles {
			//TODO может получать прификс из конфига
			if strings.Contains(r.(string), "sia") {
				role = strings.Replace(r.(string), "sia_", "", 1)
				break
			}
		}
	}

	u, ok := c["preferred_username"]
	if ok {
		username = u.(string)
	}

	uId, ok := c["sub"]
	if ok {
		userId = uId.(string)
	}

	user.Id = userId
	user.Role = role
	user.Name = username

	return user, nil
}
