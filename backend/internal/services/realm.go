package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type RealmService struct {
	repo repository.Realm
}

func NewRealmService(repo repository.Realm) *RealmService {
	return &RealmService{
		repo: repo,
	}
}

type Realm interface {
	Get(ctx context.Context, req *models.GetRealmsDTO) ([]*models.Realm, error)
	Create(ctx context.Context, dto *models.RealmDTO) error
	Update(ctx context.Context, dto *models.RealmDTO) error
	Delete(ctx context.Context, dto *models.DeleteRealmDTO) error
}

func (s *RealmService) Get(ctx context.Context, req *models.GetRealmsDTO) ([]*models.Realm, error) {
	data, err := s.repo.Get(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get realm. error: %w", err)
	}
	return data, nil
}

func (s *RealmService) Create(ctx context.Context, dto *models.RealmDTO) error {
	if err := s.repo.Create(ctx, dto); err != nil {
		return fmt.Errorf("failed to create realm. error: %w", err)
	}
	return nil
}

func (s *RealmService) Update(ctx context.Context, dto *models.RealmDTO) error {
	if err := s.repo.Update(ctx, dto); err != nil {
		return fmt.Errorf("failed to update realm. error: %w", err)
	}
	return nil
}

func (s *RealmService) Delete(ctx context.Context, dto *models.DeleteRealmDTO) error {
	if err := s.repo.Delete(ctx, dto); err != nil {
		return fmt.Errorf("failed to delete realm. error: %w", err)
	}
	return nil
}
