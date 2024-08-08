package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type DefaultFilterService struct {
	repo repository.DefaultFilter
}

func NewDefaultFilterService(repo repository.DefaultFilter) *DefaultFilterService {
	return &DefaultFilterService{
		repo: repo,
	}
}

type DefaultFilter interface {
	Get(context.Context, string) ([]*models.SIFilter, error)
	Change(context.Context, *models.ChangeFilterDTO) error
	Create(context.Context, *models.FilterDTO) error
	CreateSeveral(context.Context, []*models.FilterDTO) error
	Update(context.Context, *models.FilterDTO) error
	Delete(context.Context, *models.DeleteFilterDTO) error
	DeleteBySSOId(context.Context, string) error
}

func (s *DefaultFilterService) Get(ctx context.Context, ssoId string) ([]*models.SIFilter, error) {
	filters, err := s.repo.Get(ctx, ssoId)
	if err != nil {
		return nil, fmt.Errorf("failed to get default filters. error: %w", err)
	}
	return filters, nil
}

func (s *DefaultFilterService) Change(ctx context.Context, dto *models.ChangeFilterDTO) error {
	if err := s.DeleteBySSOId(ctx, dto.SSOId); err != nil {
		return err
	}

	if len(dto.Filters) == 0 {
		return nil
	}

	if err := s.CreateSeveral(ctx, dto.Filters); err != nil {
		return err
	}
	// if len(dto) == 0 {
	// 	//TODO удалить все фильтры
	// 	return nil
	// }

	// filters, err := s.Get(ctx, dto[0].SSOId)
	// if err != nil {
	// 	return err
	// }

	//TODO сравнить то что уже есть с тем что пришло
	// новое добавить, то что есть обновить, лишнее удалить

	return nil
}

func (s *DefaultFilterService) Create(ctx context.Context, dto *models.FilterDTO) error {
	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create filter. error: %w", err)
	}
	return nil
}

func (s *DefaultFilterService) CreateSeveral(ctx context.Context, dto []*models.FilterDTO) error {
	if err := s.repo.CreateSeveral(ctx, dto); err != nil {
		return fmt.Errorf("failed to create several filters. error: %w", err)
	}
	return nil
}

func (s *DefaultFilterService) Update(ctx context.Context, dto *models.FilterDTO) error {
	if err := s.repo.Update(ctx, dto); err != nil {
		return fmt.Errorf("failed to update filter. error: %w", err)
	}
	return nil
}

func (s *DefaultFilterService) Delete(ctx context.Context, dto *models.DeleteFilterDTO) error {
	if err := s.repo.Delete(ctx, dto); err != nil {
		return fmt.Errorf("failed to delete filter. error: %w", err)
	}
	return nil
}

func (s *DefaultFilterService) DeleteBySSOId(ctx context.Context, ssoId string) error {
	if err := s.repo.DeleteBySSOId(ctx, ssoId); err != nil {
		return fmt.Errorf("failed to delete filter by sso id. error: %w", err)
	}
	return nil
}
