package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type MenuItemService struct {
	repo repository.MenuItem
}

func NewMenuItemService(repo repository.MenuItem) *MenuItemService {
	return &MenuItemService{
		repo: repo,
	}
}

type MenuItem interface {
	Create(context.Context, models.MenuItemDTO) error
	Update(context.Context, models.MenuItemDTO) error
	Delete(context.Context, string) error
}

// func (s *MenuItemService) GetAll(ctx context.Context) ([]models.MenuItem, error)

func (s *MenuItemService) Create(ctx context.Context, menu models.MenuItemDTO) error {
	if err := s.repo.Create(ctx, menu); err != nil {
		return fmt.Errorf("failed to create menu item. error: %w", err)
	}
	return nil
}

func (s *MenuItemService) Update(ctx context.Context, menu models.MenuItemDTO) error {
	if err := s.repo.Update(ctx, menu); err != nil {
		return fmt.Errorf("failed to update menu item. error: %w", err)
	}
	return nil
}

func (s *MenuItemService) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete menu item. error: %w", err)
	}
	return nil
}
