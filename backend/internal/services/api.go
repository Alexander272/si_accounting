package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type ApiPathsService struct {
	repo repository.ApiPaths
}

func NewApiPathsService(repo repository.ApiPaths) *ApiPathsService {
	return &ApiPathsService{
		repo: repo,
	}
}

type ApiPaths interface {
	GetAll(context.Context) ([]models.Api, error)
	Create(context.Context, models.ApiDTO) error
	CreateSeveral(context.Context, []models.ApiDTO) error
	Load(context.Context, map[string]models.ApiDTO) error
	Update(context.Context, models.ApiDTO) error
	Delete(context.Context, string) error
}

func (s *ApiPathsService) GetAll(ctx context.Context) ([]models.Api, error) {
	api, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all api paths. error: %w", err)
	}
	return api, nil
}

func (s *ApiPathsService) Create(ctx context.Context, api models.ApiDTO) error {
	if err := s.repo.Create(ctx, api); err != nil {
		return fmt.Errorf("failed to create api path. error: %w", err)
	}
	return nil
}

func (s *ApiPathsService) CreateSeveral(ctx context.Context, api []models.ApiDTO) error {
	if err := s.repo.CreateSeveral(ctx, api); err != nil {
		return fmt.Errorf("failed to create several api paths. error: %w", err)
	}
	return nil
}

func (s *ApiPathsService) Load(ctx context.Context, allPaths map[string]models.ApiDTO) error {
	paths, err := s.GetAll(ctx)
	if err != nil {
		return err
	}

	if len(paths) == len(allPaths) {
		return nil
	}

	for _, a := range paths {
		_, exists := allPaths[a.Path]
		if exists {
			delete(allPaths, a.Path)
		}
	}

	newPaths := make([]models.ApiDTO, 0, len(allPaths))
	for _, ad := range allPaths {
		newPaths = append(newPaths, ad)
	}

	if len(newPaths) > 0 {
		if err := s.CreateSeveral(ctx, newPaths); err != nil {
			return err
		}
	}
	return nil
}

func (s *ApiPathsService) Update(ctx context.Context, api models.ApiDTO) error {
	if err := s.repo.Update(ctx, api); err != nil {
		return fmt.Errorf("failed to update api path. error: %w", err)
	}
	return nil
}

func (s *ApiPathsService) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete api path. error: %w", err)
	}
	return nil
}
