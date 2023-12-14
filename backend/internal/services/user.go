package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type UserService struct {
	repo repository.User
}

func NewUserService(repo repository.User) *UserService {
	return &UserService{
		repo: repo,
	}
}

type User interface {
	GetByDepartment(context.Context, string) ([]models.User, error)
	Create(context.Context, models.WriteUserDTO) error
	Update(context.Context, models.WriteUserDTO) error
	Delete(context.Context, string) error
}

func (s *UserService) GetByDepartment(ctx context.Context, departmentId string) ([]models.User, error) {
	users, err := s.repo.GetByDepartment(ctx, departmentId)
	if err != nil {
		return nil, fmt.Errorf("failed to get users by department. error: %w", err)
	}
	return users, nil
}

func (s *UserService) Create(ctx context.Context, user models.WriteUserDTO) error {
	if err := s.repo.Create(ctx, user); err != nil {
		return fmt.Errorf("failed to create user. error: %w", err)
	}
	return nil
}

func (s *UserService) Update(ctx context.Context, user models.WriteUserDTO) error {
	if err := s.repo.Update(ctx, user); err != nil {
		return fmt.Errorf("failed to update user. error: %w", err)
	}
	return nil
}

func (s *UserService) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete user. error: %w", err)
	}
	return nil
}
