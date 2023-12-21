package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type LocationService struct {
	repo repository.Location
}

func NewLocationService(repo repository.Location) *LocationService {
	return &LocationService{
		repo: repo,
	}
}

type Location interface {
	GetLast(context.Context, string) (*models.Location, error)
	Create(context.Context, models.CreateLocationDTO) error
	Update(context.Context, models.UpdateLocationDTO) error
	Receiving(context.Context, models.ReceivingDTO) error
}

func (s *LocationService) GetLast(ctx context.Context, instrumentId string) (*models.Location, error) {
	location, err := s.repo.GetLast(ctx, instrumentId)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get last si location. error: %w", err)
	}
	return location, nil
}

func (s *LocationService) Create(ctx context.Context, location models.CreateLocationDTO) error {
	if err := s.repo.Create(ctx, location); err != nil {
		return fmt.Errorf("failed to create si location. error: %w", err)
	}
	return nil
}

func (s *LocationService) Update(ctx context.Context, location models.UpdateLocationDTO) error {
	if err := s.repo.Update(ctx, location); err != nil {
		return fmt.Errorf("failed to update si location. error: %w", err)
	}
	return nil
}

func (s *LocationService) Receiving(ctx context.Context, location models.ReceivingDTO) error {
	if err := s.repo.Receiving(ctx, location); err != nil {
		return fmt.Errorf("failed to receiving si location. error: %w", err)
	}
	return nil
}
