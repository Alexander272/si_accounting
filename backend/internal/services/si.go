package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type SIService struct {
	repo         repository.SI
	instrument   Instrument
	verification Verification
	location     Location
}

func NewSIService(repo repository.SI, instrument Instrument, verification Verification, location Location) *SIService {
	return &SIService{
		repo:         repo,
		instrument:   instrument,
		verification: verification,
		location:     location,
	}
}

type SI interface {
	GetAll(context.Context, *models.SIParams) (*models.SIList, error)
	GetForNotification(context.Context, *models.Period) ([]*models.Notification, error)
	Save(ctx context.Context, id string) error
	Create(context.Context, *models.CreateSIDTO) error
}

func (s *SIService) GetAll(ctx context.Context, req *models.SIParams) (*models.SIList, error) {
	list, err := s.repo.GetAll(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get all si. error: %w", err)
	}
	return list, err
}

func (s *SIService) GetForNotification(ctx context.Context, req *models.Period) ([]*models.Notification, error) {
	list, err := s.repo.GetForNotification(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get si for notification. error: %w", err)
	}
	return list, nil
}

func (s *SIService) Save(ctx context.Context, id string) error {
	if err := s.instrument.ChangeStatus(ctx, &models.UpdateStatus{Id: id, Status: constants.InstrumentStatusWork}); err != nil {
		return fmt.Errorf("failed to save si. error: %w", err)
	}
	return nil
}

func (s *SIService) Create(ctx context.Context, dto *models.CreateSIDTO) error {
	id, err := s.instrument.Create(ctx, dto.Instrument)
	if err != nil {
		return err
	}

	dto.Location.InstrumentId = id
	dto.Verification.InstrumentId = id

	if err := s.verification.Create(ctx, dto.Verification); err != nil {
		s.instrument.Delete(ctx, id)
		return err
	}
	if err := s.location.Create(ctx, dto.Location); err != nil {
		s.instrument.Delete(ctx, id)
		return err
	}
	return nil
}
