package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type LocationService struct {
	repo     repository.Location
	employee Employee
}

func NewLocationService(repo repository.Location, employee Employee) *LocationService {
	return &LocationService{
		repo:     repo,
		employee: employee,
	}
}

type Location interface {
	GetLast(context.Context, string) (*models.Location, error)
	GetByInstrumentId(context.Context, string) ([]models.Location, error)
	Create(context.Context, models.CreateLocationDTO) error
	Update(context.Context, models.UpdateLocationDTO) error
	Receiving(context.Context, models.ReceivingDTO) error
	Delete(context.Context, string) error
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

func (s *LocationService) GetByInstrumentId(ctx context.Context, instrumentId string) ([]models.Location, error) {
	locations, err := s.repo.GetByInstrumentId(ctx, instrumentId)
	if err != nil {
		return nil, fmt.Errorf("failed to get locations by instrument id. error: %w", err)
	}
	return locations, nil
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

func (s *LocationService) ReceivingFromBot(ctx context.Context, req models.ReceivingFromBotDTO) error {
	// я могу получить id пользователя и данные о нем
	// а потом на основе них найти список инструментов которые нужно получить или можно сразу проставить отметку о получении

	// employee, err := s.employee.GetByMostId(ctx, req.UserMostId)
	// if err != nil {
	// 	return err
	// }

	return fmt.Errorf("not implemented")
}

func (s *LocationService) Delete(ctx context.Context, id string) error {
	// TODO делать ли тут доп проверку (чтобы можно было удалить только то, что перемещается) для всех кроме админа
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete si location. error: %w", err)
	}
	return nil
}
