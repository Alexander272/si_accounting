package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type MenuWithApiService struct {
	repo repository.MenuWithApi
}

func NewMenuWithApiService(repo repository.MenuWithApi) *MenuWithApiService {
	return &MenuWithApiService{
		repo: repo,
	}
}

type MenuWithApi interface {
	GetAll(context.Context) ([]models.MenuItem, error)
	Create(context.Context, models.MenuWithApiDTO) error
	Update(context.Context, models.MenuWithApiDTO) error
	Delete(context.Context, string) error
}

func (s *MenuWithApiService) GetAll(ctx context.Context) ([]models.MenuItem, error) {
	menu, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all menu with api. error: %w", err)
	}
	return menu, nil
}

func (s *MenuWithApiService) Create(ctx context.Context, menu models.MenuWithApiDTO) error {
	if err := s.repo.Create(ctx, menu); err != nil {
		return fmt.Errorf("failed to create menu with api. error: %w", err)
	}
	return nil
}

func (s *MenuWithApiService) Update(ctx context.Context, menu models.MenuWithApiDTO) error {
	if err := s.repo.Update(ctx, menu); err != nil {
		return fmt.Errorf("failed to update menu with api. error: %w", err)
	}
	return nil
}

func (s *MenuWithApiService) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete menu with api. error: %w", err)
	}
	return nil
}
