package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type VerificationService struct {
	repo repository.Verification
}

func NewVerificationService(repo repository.Verification) *VerificationService {
	return &VerificationService{
		repo: repo,
	}
}

type Verification interface {
	GetLast(context.Context, string) (*models.Verification, error)
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

func (s *VerificationService) Create(ctx context.Context, v models.CreateVerificationDTO) error {
	if err := s.repo.Create(ctx, v); err != nil {
		return fmt.Errorf("failed to create verification. error: %w", err)
	}
	return nil
}

func (s *VerificationService) Update(ctx context.Context, v models.UpdateVerificationDTO) error {
	if err := s.repo.Update(ctx, v); err != nil {
		return fmt.Errorf("failed to update verification. error: %w", err)
	}
	return nil
}
