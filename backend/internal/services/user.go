package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
	"github.com/Alexander272/si_accounting/backend/pkg/auth"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/Nerzal/gocloak/v13"
)

type UserService struct {
	repo     repository.User
	keycloak *auth.KeycloakClient
}

func NewUserService(repo repository.User, keycloak *auth.KeycloakClient) *UserService {
	return &UserService{
		repo:     repo,
		keycloak: keycloak,
	}
}

type User interface {
	GetAll(ctx context.Context) ([]*models.UserData, error)
	GetByRealm(ctx context.Context, req *models.GetByRealmDTO) ([]*models.UserData, error)
	GetById(ctx context.Context, id string) (*models.UserData, error)
	GetBySSOId(ctx context.Context, id string) (*models.UserData, error)
	Sync(ctx context.Context) error
	Create(ctx context.Context, dto *models.UserData) error
	CreateSeveral(ctx context.Context, dto []*models.UserData) error
	Update(ctx context.Context, dto *models.UserData) error
	UpdateSeveral(ctx context.Context, dto []*models.UserData) error
	Delete(ctx context.Context, id string) error
	DeleteSeveral(ctx context.Context, ids []string) error
}

func (s *UserService) GetAll(ctx context.Context) ([]*models.UserData, error) {
	data, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all users. error: %w", err)
	}
	return data, nil
}

func (s *UserService) GetByRealm(ctx context.Context, req *models.GetByRealmDTO) ([]*models.UserData, error) {
	data, err := s.repo.GetByRealm(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get users by realm. error: %w", err)
	}
	return data, nil
}

func (s *UserService) GetById(ctx context.Context, id string) (*models.UserData, error) {
	data, err := s.repo.GetById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by id. error: %w", err)
	}
	return data, nil
}

func (s *UserService) GetBySSOId(ctx context.Context, id string) (*models.UserData, error) {
	data, err := s.repo.GetBySSOId(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by sso_id. error: %w", err)
	}
	return data, nil
}

/*
	TODO
	Можно записывать пользователей из keycloak в таблицу пользователей, а ответственных брать из таблицы с доступами выбирая по ролям
	и нужному realm
*/

func (s *UserService) Sync(ctx context.Context) error {
	logger.Info("Sync users")

	token, err := s.keycloak.Login(ctx)
	if err != nil {
		return fmt.Errorf("failed to login to keycloak. error: %w", err)
	}

	// получение Id группы
	groupID := ""
	groups, err := s.keycloak.Client.GetGroups(ctx, token.AccessToken, s.keycloak.Realm, gocloak.GetGroupsParams{})
	if err != nil {
		return fmt.Errorf("failed to get groups. error: %w", err)
	}
	for _, g := range groups {
		if g.Name != nil && *g.Name == "sia" {
			groupID = *g.ID
			break
		}
		// logger.Debug("get all groups", logger.StringAttr("group", *g.Name), logger.StringAttr("id", *g.ID))
		// if g.SubGroups != nil {
		// 	for _, sg := range *g.SubGroups {
		// 		logger.Debug("get all groups", logger.StringAttr("group", *sg.Name), logger.StringAttr("id", *sg.ID))
		// 	}
		// }
	}

	data := []*models.UserData{}
	keycloakUsers, err := s.keycloak.Client.GetGroupMembers(ctx, token.AccessToken, s.keycloak.Realm, groupID, gocloak.GetGroupsParams{})
	if err != nil {
		return fmt.Errorf("failed to get group users. error: %w", err)
	}
	for _, u := range keycloakUsers {
		if u.Enabled != nil && !*u.Enabled {
			continue
		}

		item := &models.UserData{}
		if u.ID != nil {
			item.SSOId = *u.ID
		}
		if u.Username != nil {
			item.Username = *u.Username
		}
		if u.Email != nil {
			item.Email = *u.Email
		}
		if u.FirstName != nil {
			item.FirstName = *u.FirstName
		}
		if u.LastName != nil {
			item.LastName = *u.LastName
		}
		data = append(data, item)

		// logger.Debug("get all users", logger.StringAttr("user", *u.Username), logger.StringAttr("id", *u.ID), logger.StringAttr("email", *u.Email))
	}
	// logger.Debug("get all users", logger.IntAttr("users len", len(users)))

	users, err := s.GetAll(ctx)
	if err != nil {
		return err
	}

	new := []*models.UserData{}
	updated := []*models.UserData{}
	deleted := []string{}

	founded := map[string]bool{}

	for _, d := range users {
		founded[d.SSOId] = false
	}
	for _, u := range data {
		_, ok := founded[u.SSOId]
		if ok {
			updated = append(updated, u)
			founded[u.SSOId] = true
		} else {
			new = append(new, u)
		}
	}
	for k, v := range founded {
		if !v {
			deleted = append(deleted, k)
		}
	}

	if err := s.CreateSeveral(ctx, new); err != nil {
		return err
	}
	if err := s.UpdateSeveral(ctx, updated); err != nil {
		return err
	}
	if err := s.DeleteSeveral(ctx, deleted); err != nil {
		return err
	}

	return nil
}

func (s *UserService) Create(ctx context.Context, dto *models.UserData) error {
	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create user. error: %w", err)
	}
	return nil
}

func (s *UserService) CreateSeveral(ctx context.Context, dto []*models.UserData) error {
	if len(dto) == 0 {
		return nil
	}
	if err := s.repo.CreateSeveral(ctx, dto); err != nil {
		return fmt.Errorf("failed to create few users. error: %w", err)
	}
	return nil
}

func (s *UserService) Update(ctx context.Context, dto *models.UserData) error {
	if err := s.repo.Update(ctx, dto); err != nil {
		return fmt.Errorf("failed to update user. error: %w", err)
	}
	return nil
}

func (s *UserService) UpdateSeveral(ctx context.Context, dto []*models.UserData) error {
	if len(dto) == 0 {
		return nil
	}
	if err := s.repo.UpdateSeveral(ctx, dto); err != nil {
		return fmt.Errorf("failed to update few users. error: %w", err)
	}
	return nil
}

func (s *UserService) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete user. error: %w", err)
	}
	return nil
}

func (s *UserService) DeleteSeveral(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	if err := s.repo.DeleteSeveral(ctx, ids); err != nil {
		return fmt.Errorf("failed to delete few users. error: %w", err)
	}
	return nil
}
