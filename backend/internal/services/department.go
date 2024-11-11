package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type DepartmentService struct {
	repo     repository.Department
	location Location
}

func NewDepartmentService(repo repository.Department, location Location) *DepartmentService {
	return &DepartmentService{
		repo:     repo,
		location: location,
	}
}

type Department interface {
	GetAll(context.Context) ([]*models.Department, error)
	GetById(context.Context, string) (*models.Department, error)
	GetBySSOId(context.Context, string) ([]*models.Department, error)
	Create(context.Context, *models.Department) (string, error)
	Update(context.Context, *models.Department) error
	Delete(context.Context, string) error
}

func (s *DepartmentService) GetAll(ctx context.Context) ([]*models.Department, error) {
	departments, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all departments. error: %w", err)
	}
	if departments == nil {
		departments = []*models.Department{}
	}
	return departments, nil
}

func (s *DepartmentService) GetById(ctx context.Context, id string) (*models.Department, error) {
	department, err := s.repo.GetById(ctx, id)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get department by id. error: %w", err)
	}
	return department, nil
}

func (s *DepartmentService) GetBySSOId(ctx context.Context, id string) ([]*models.Department, error) {
	departments, err := s.repo.GetBySSOId(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get departments by sso id. error: %w", err)
	}
	return departments, nil
}

func (s *DepartmentService) Create(ctx context.Context, department *models.Department) (string, error) {
	id, err := s.repo.Create(ctx, department)
	if err != nil {
		return id, fmt.Errorf("failed to create department. error: %w", err)
	}
	return id, nil
}

func (s *DepartmentService) Update(ctx context.Context, department *models.Department) error {
	if err := s.repo.Update(ctx, department); err != nil {
		return fmt.Errorf("failed to update department. error: %w", err)
	}

	if err := s.location.UpdatePlace(ctx, &models.UpdatePlaceDTO{DepartmentId: department.Id}); err != nil {
		return err
	}

	return nil
}

func (s *DepartmentService) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete department. error: %w", err)
	}
	return nil
}
