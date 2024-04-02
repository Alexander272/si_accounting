package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
)

type InstrumentService struct {
	repo      repository.Instrument
	documents Documents
}

func NewInstrumentService(repo repository.Instrument, documents Documents) *InstrumentService {
	return &InstrumentService{
		repo:      repo,
		documents: documents,
	}
}

type Instrument interface {
	GetById(ctx context.Context, id string) (*models.Instrument, error)
	Create(ctx context.Context, in models.CreateInstrumentDTO) error
	Update(ctx context.Context, in models.UpdateInstrumentDTO) error
	ChangeStatus(ctx context.Context, status models.UpdateStatus) error
	Delete(ctx context.Context, id string) error
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
	candidate, err := s.GetById(ctx, "")
	if err != nil && !errors.Is(err, models.ErrNoRows) {
		return err
	}

	if err = s.repo.Create(ctx, in); err != nil {
		return fmt.Errorf("failed to create instrument. error: %w", err)
	}

	if candidate != nil {
		logger.Debug("delete instrument")
		if err := s.Delete(ctx, candidate.Id); err != nil {
			return err
		}
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

func (s *InstrumentService) Delete(ctx context.Context, id string) error {
	candidate, err := s.GetById(ctx, id)
	if err != nil {
		return err
	}

	if candidate.Status == constants.InstrumentDraft {
		if err := s.repo.Delete(ctx, id); err != nil {
			return fmt.Errorf("failed to delete instrument. error: %w", err)
		}

		if err := s.documents.DeleteByInstrumentId(ctx, id); err != nil {
			return err
		}
	}

	if err := s.ChangeStatus(ctx, models.UpdateStatus{Id: id, Status: constants.InstrumentDeleted}); err != nil {
		return err
	}

	return nil
}
