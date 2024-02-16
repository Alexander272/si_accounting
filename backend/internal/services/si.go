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
	GetAll(context.Context, models.SIParams) (*models.SIList, error)
	GetForNotification(context.Context, models.Period) ([]models.Notification, error)
	Save(ctx context.Context, id string) error
}

func (s *SIService) GetAll(ctx context.Context, req models.SIParams) (*models.SIList, error) {
	list, err := s.repo.GetAll(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get all si. error: %w", err)
	}
	return list, err
}

func (s *SIService) GetForNotification(ctx context.Context, req models.Period) ([]models.Notification, error) {
	list, err := s.repo.GetForNotification(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get si for notification. error: %w", err)
	}
	return list, nil
}

func (s *SIService) Save(ctx context.Context, id string) error {
	if err := s.instrument.ChangeStatus(ctx, models.UpdateStatus{Id: id, Status: constants.InstrumentStatusWork}); err != nil {
		return fmt.Errorf("failed to save si. error: %w", err)
	}
	return nil
}
