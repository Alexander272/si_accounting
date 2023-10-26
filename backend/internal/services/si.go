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
	GetAll(context.Context, models.SIParams) ([]models.SI, int, error)
	Save(ctx context.Context, id string) error
}

func (s *SIService) GetAll(ctx context.Context, req models.SIParams) ([]models.SI, int, error) {
	si, total, err := s.repo.GetAll(ctx, req)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get all si. error: %w", err)
	}
	return si, total, err
}

func (s *SIService) Save(ctx context.Context, id string) error {
	if err := s.instrument.ChangeStatus(ctx, models.UpdateStatus{Id: id, Status: constants.InstrumentStatusWork}); err != nil {
		return fmt.Errorf("failed to save si. error: %w", err)
	}
	return nil
}
