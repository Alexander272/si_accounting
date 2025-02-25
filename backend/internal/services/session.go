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
	SignIn(ctx context.Context, u *models.SignIn) (*models.User, error)
	SignOut(ctx context.Context, refreshToken string) error
	Refresh(ctx context.Context, req *models.RefreshDTO) (*models.User, error)
	DecodeAccessToken(ctx context.Context, token string) (*models.User, error)
}

func (s *SessionService) SignIn(ctx context.Context, u *models.SignIn) (*models.User, error) {
	res, err := s.keycloak.Client.Login(ctx, s.keycloak.ClientId, s.keycloak.ClientSecret, s.keycloak.Realm, u.Username, u.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to login to keycloak. error: %w", err)
	}

	user, err := s.DecodeAccessToken(ctx, res.AccessToken)
	if err != nil {
		return nil, err
	}

	// получить роли сгруппированные по областям
	/*
		SELECT r.id, name, description, level, realm_id
			FROM public.roles AS r
			INNER JOIN accesses AS a ON a.role_id=r.id
			LEFT JOIN LATERAL (SELECT sso_id from users WHERE id=a.user_id) AS u ON true
			WHERE sso_id='ed6bf9fa-9168-414d-a413-281439cbbacb';
	*/
	// еще надо получить доступные разделы для каждой роли

	// если область не будет задана надо будет получить область по умолчанию или как-то еще определять область

	//? или получать только роль для нужной области, а при переключении запрашивать новую роль?

	// можно попробовать закинуть роль и id области в куки по ключу sia_identity
	// в куки засунуть сразу несколько полей проблемно (надо превращать в json, а потом обратно)

	req := &models.GetRoleByRealmDTO{UserId: user.Id, RealmId: u.Realm}
	role, err := s.role.GetByRealm(ctx, req)
	if err != nil {
		return nil, err
	}
	user.Role = role.Name
	u.Realm = req.RealmId

	// get menu
	menu, err := s.role.Get(ctx, user.Role)
	if err != nil {
		return nil, err
	}

	// get default filters
	filters, err := s.filter.Get(ctx, &models.GetFilterDTO{SSOId: user.Id, RealmId: req.RealmId})
	if err != nil {
		return nil, err
	}

	user.AccessToken = res.AccessToken
	user.RefreshToken = res.RefreshToken
	user.Menu = menu.Menu
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

func (s *SessionService) Refresh(ctx context.Context, req *models.RefreshDTO) (*models.User, error) {
	res, err := s.keycloak.Client.RefreshToken(ctx, req.Token, s.keycloak.ClientId, s.keycloak.ClientSecret, s.keycloak.Realm)
	if err != nil {
		return nil, fmt.Errorf("failed to refresh token in keycloak. error: %w", err)
	}

	user, err := s.DecodeAccessToken(ctx, res.AccessToken)
	if err != nil {
		return nil, err
	}

	role, err := s.role.GetByRealm(ctx, &models.GetRoleByRealmDTO{UserId: user.Id, RealmId: req.Realm})
	if err != nil {
		return nil, err
	}
	user.Role = role.Name

	// get menu
	menu, err := s.role.Get(ctx, user.Role)
	if err != nil {
		return nil, err
	}

	// get default filters
	filters, err := s.filter.Get(ctx, &models.GetFilterDTO{SSOId: user.Id, RealmId: req.Realm})
	if err != nil {
		return nil, err
	}

	user.AccessToken = res.AccessToken
	user.RefreshToken = res.RefreshToken
	user.Menu = menu.Menu
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
