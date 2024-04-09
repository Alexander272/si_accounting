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
	Get(context.Context, string) ([]models.SIFilter, error)
}

func (s *DefaultFilterService) Get(ctx context.Context, ssoId string) ([]models.SIFilter, error) {
	filters, err := s.repo.Get(ctx, ssoId)
	if err != nil {
		return nil, fmt.Errorf("failed to get default filters. error: %w", err)
	}
	return filters, nil
}
