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
	most     Most
}

func NewLocationService(repo repository.Location, employee Employee, most Most) *LocationService {
	return &LocationService{
		repo:     repo,
		employee: employee,
		most:     most,
	}
}

type Location interface {
	GetLast(context.Context, string) (*models.Location, error)
	GetByInstrumentId(context.Context, string) ([]models.Location, error)
	CreateSeveral(context.Context, models.CreateSeveralLocationDTO) (bool, error)
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

func (s *LocationService) FilterByDepartmentId(ctx context.Context, filter models.DepartmentFilterDTO) ([]string, error) {
	ids, err := s.repo.FilterByDepartmentId(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to filter locations by department id. error: %w", err)
	}
	return ids, nil
}

func (s *LocationService) Create(ctx context.Context, location models.CreateLocationDTO) error {
	if err := s.repo.Create(ctx, location); err != nil {
		return fmt.Errorf("failed to create si location. error: %w", err)
	}
	return nil
}

func (s *LocationService) CreateSeveral(ctx context.Context, dto models.CreateSeveralLocationDTO) (bool, error) {
	emp, err := s.employee.GetBySSOId(ctx, dto.UserId)
	if err != nil && !errors.Is(err, models.ErrNoRows) {
		return false, err
	}

	isFull := true

	if emp != nil {
		instrumentIds := []string{}
		locations := make(map[string]models.CreateLocationDTO)
		for _, l := range dto.Locations {
			instrumentIds = append(instrumentIds, l.InstrumentId)
			locations[l.InstrumentId] = l
		}

		filtered, err := s.FilterByDepartmentId(ctx, models.DepartmentFilterDTO{InstrumentIds: instrumentIds, DepartmentId: emp.DepartmentId})
		if err != nil {
			return false, err
		}

		isFull = len(filtered) == len(dto.Locations)
		if !isFull {
			newLocations := []models.CreateLocationDTO{}
			for _, l := range filtered {
				newLocations = append(newLocations, locations[l])
			}
			dto.Locations = newLocations
		}
	}

	if err := s.repo.CreateSeveral(ctx, dto.Locations); err != nil {
		return isFull, fmt.Errorf("failed to create several locations. error: %w", err)
	}
	return isFull, nil
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
	if err := s.most.Update(ctx, location.PostID); err != nil {
		return err
	}
	return nil
}

func (s *LocationService) Delete(ctx context.Context, id string) error {
	// TODO делать ли тут доп проверку (чтобы можно было удалить только то, что перемещается) для всех кроме админа
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete si location. error: %w", err)
	}
	return nil
}
