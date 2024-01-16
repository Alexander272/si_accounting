package services

import (
	"context"
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
)

type EmployeeService struct {
	repo repository.Employee
}

func NewEmployeeService(repo repository.Employee) *EmployeeService {
	return &EmployeeService{
		repo: repo,
	}
}

type Employee interface {
	GetAll(context.Context, models.GetEmployeesDTO) ([]models.Employee, error)
	GetByDepartment(context.Context, string) ([]models.Employee, error)
	GetByMostId(context.Context, string) (*models.EmployeeData, error)
	Create(context.Context, models.WriteEmployeeDTO) error
	Update(context.Context, models.WriteEmployeeDTO) error
	Delete(context.Context, string) error
}

func (s *EmployeeService) GetAll(ctx context.Context, req models.GetEmployeesDTO) ([]models.Employee, error) {
	employees, err := s.repo.GetAll(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to get employees. error: %w", err)
	}
	return employees, nil
}

func (s *EmployeeService) GetByDepartment(ctx context.Context, departmentId string) ([]models.Employee, error) {
	users, err := s.repo.GetByDepartment(ctx, departmentId)
	if err != nil {
		return nil, fmt.Errorf("failed to get employees by department. error: %w", err)
	}
	return users, nil
}

func (s *EmployeeService) GetByMostId(ctx context.Context, mostId string) (*models.EmployeeData, error) {
	employee, err := s.repo.GetByMostId(ctx, mostId)
	if err != nil {
		return nil, fmt.Errorf("failed to get employee by most id. error: %w", err)
	}
	return employee, nil
}

func (s *EmployeeService) Create(ctx context.Context, employee models.WriteEmployeeDTO) error {
	if err := s.repo.Create(ctx, employee); err != nil {
		return fmt.Errorf("failed to create employee. error: %w", err)
	}
	return nil
}

func (s *EmployeeService) Update(ctx context.Context, employee models.WriteEmployeeDTO) error {
	if err := s.repo.Update(ctx, employee); err != nil {
		return fmt.Errorf("failed to update employee. error: %w", err)
	}
	return nil
}

func (s *EmployeeService) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete employee. error: %w", err)
	}
	return nil
}
