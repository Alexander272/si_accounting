package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type VerificationService struct {
	repo       repository.Verification
	documents  Documents
	instrument Instrument
}

func NewVerificationService(repo repository.Verification, documents Documents, instrument Instrument) *VerificationService {
	return &VerificationService{
		repo:       repo,
		documents:  documents,
		instrument: instrument,
	}
}

type Verification interface {
	GetLast(context.Context, string) (*models.Verification, error)
	GetByInstrumentId(context.Context, string) ([]models.VerificationDataDTO, error)
	Create(context.Context, models.CreateVerificationDTO) error
	Update(context.Context, models.UpdateVerificationDTO) error
}

func (s *VerificationService) GetLast(ctx context.Context, instrumentId string) (*models.Verification, error) {
	verification, err := s.repo.GetLast(ctx, instrumentId)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get last verification. error: %w", err)
	}
	return verification, nil
}

func (s *VerificationService) GetByInstrumentId(ctx context.Context, instrumentId string) ([]models.VerificationDataDTO, error) {
	verifications, err := s.repo.GetByInstrumentId(ctx, instrumentId)
	if err != nil {
		return nil, fmt.Errorf("failed to get verifications by instrument id. error: %w", err)
	}
	return verifications, nil
}

func (s *VerificationService) Create(ctx context.Context, v models.CreateVerificationDTO) error {
	id, err := s.repo.Create(ctx, v)
	if err != nil {
		return fmt.Errorf("failed to create verification. error: %w", err)
	}

	if err := s.documents.ChangePath(ctx, models.PathParts{VerificationId: id, InstrumentId: v.InstrumentId}); err != nil {
		return fmt.Errorf("failed to change path documents. error: %w", err)
	}

	if !v.IsDraftInstrument {
		if err := s.instrument.ChangeStatus(ctx, models.UpdateStatus{Id: v.InstrumentId, Status: v.Status}); err != nil {
			return err
		}
	}

	return nil
}

func (s *VerificationService) Update(ctx context.Context, v models.UpdateVerificationDTO) error {
	if err := s.repo.Update(ctx, v); err != nil {
		return fmt.Errorf("failed to update verification. error: %w", err)
	}

	if err := s.instrument.ChangeStatus(ctx, models.UpdateStatus{Id: v.InstrumentId, Status: v.Status}); err != nil {
		return err
	}

	return nil
}
