package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type InstrumentService struct {
	repo repository.Instrument
}

func NewInstrumentService(repo repository.Instrument) *InstrumentService {
	return &InstrumentService{
		repo: repo,
	}
}

type Instrument interface {
	GetById(ctx context.Context, id string) (*models.Instrument, error)
	Create(ctx context.Context, in models.CreateInstrumentDTO) error
	Update(ctx context.Context, in models.UpdateInstrumentDTO) error
	ChangeStatus(ctx context.Context, status models.UpdateStatus) error
}

func (s *InstrumentService) GetById(ctx context.Context, id string) (*models.Instrument, error) {
	instrument, err := s.repo.GetById(ctx, id)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get instrument by id. error: %w", err)
	}
	return instrument, nil
}

func (s *InstrumentService) Create(ctx context.Context, in models.CreateInstrumentDTO) error {
	if err := s.repo.Create(ctx, in); err != nil {
		return fmt.Errorf("failed to create instrument. error: %w", err)
	}
	return nil
}

func (s *InstrumentService) Update(ctx context.Context, in models.UpdateInstrumentDTO) error {
	if err := s.repo.Update(ctx, in); err != nil {
		return fmt.Errorf("failed to update instrument. error: %w", err)
	}
	return nil
}

func (s *InstrumentService) ChangeStatus(ctx context.Context, status models.UpdateStatus) error {
	if err := s.repo.ChangeStatus(ctx, status); err != nil {
		return fmt.Errorf("failed to change instrument status. error: %w", err)
	}
	return nil
}
