package services

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/repository"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/goccy/go-json"
)

type LocationService struct {
	repo        repository.Location
	department  Department
	responsible Responsible
	most        Most
	// employee Employee
}

type LocationDeps struct {
	Repo        repository.Location
	Department  Department
	Responsible Responsible
	Most        Most
}

// func NewLocationService(repo repository.Location, employee Employee, most Most) *LocationService {
func NewLocationService(deps *LocationDeps) *LocationService {
	return &LocationService{
		repo:        deps.Repo,
		department:  deps.Department,
		responsible: deps.Responsible,
		most:        deps.Most,
		// employee: employee,
	}
}

type Location interface {
	GetLast(context.Context, string) (*models.Location, error)
	GetByInstrumentId(context.Context, string) ([]*models.Location, error)
	CreateSeveral(context.Context, *models.CreateSeveralLocationDTO) (bool, error)
	// CreateSeveral(context.Context, *models.CreateSeveralLocationDTO) error
	Create(context.Context, *models.CreateLocationDTO) error
	Update(context.Context, *models.UpdateLocationDTO) error
	UpdatePlace(context.Context, *models.UpdatePlaceDTO) error
	UpdatePerson(context.Context, *models.UpdatePlaceDTO) error
	ReceivingFromApp(context.Context, *models.ReceivingDTO) error
	Receiving(context.Context, *models.DialogResponse) error
	ForcedReceiptMany(context.Context) error
	ForcedReceipt(context.Context, *models.ForcedReceiptDTO) error
	Delete(context.Context, string) error
}

func (s *LocationService) GetLast(ctx context.Context, instrumentId string) (*models.Location, error) {
	location, err := s.repo.GetLast(ctx, instrumentId)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get last si location. error: %w", err)
	}
	return location, nil
}

func (s *LocationService) GetByInstrumentId(ctx context.Context, instrumentId string) ([]*models.Location, error) {
	locations, err := s.repo.GetByInstrumentId(ctx, instrumentId)
	if err != nil {
		return nil, fmt.Errorf("failed to get locations by instrument id. error: %w", err)
	}
	return locations, nil
}

func (s *LocationService) FilterByDepartments(ctx context.Context, filter *models.DepartmentFilterDTO) ([]string, error) {
	ids, err := s.repo.FilterByDepartments(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to filter locations by department id. error: %w", err)
	}
	return ids, nil
}

func (s *LocationService) Create(ctx context.Context, location *models.CreateLocationDTO) error {
	if location.Status == constants.LocationStatusMoved && location.DepartmentId != "" {
		department, err := s.department.GetById(ctx, location.DepartmentId)
		if err != nil {
			return err
		}
		if department.ChannelId == "" {
			return models.ErrNoChannel
		}

		responsible, err := s.responsible.Get(ctx, &models.GetResponsibleDTO{DepartmentId: location.DepartmentId})
		if err != nil {
			return err
		}

		if len(responsible) == 0 {
			return models.ErrNoResponsible
		}
	}

	if err := s.repo.Create(ctx, location); err != nil {
		return fmt.Errorf("failed to create si location. error: %w", err)
	}
	return nil
}

func (s *LocationService) CreateSeveral(ctx context.Context, dto *models.CreateSeveralLocationDTO) (bool, error) {
	responsible, err := s.responsible.GetBySSOId(ctx, dto.UserId)
	if err != nil {
		return false, err
	}

	//TODO для инструментов которые перемещаются из резерва, проверка не нужна
	//// В таком виде эта функция не будет работать для метролога

	isFull := true

	if dto.Locations[0].PersonId == "" && dto.Locations[0].NeedConfirmed {
		if len(responsible) == 0 {
			return false, models.ErrNoResponsible
		}

		instrumentIds := []string{}
		locations := make(map[string]*models.CreateLocationDTO)
		for _, l := range dto.Locations {
			instrumentIds = append(instrumentIds, l.InstrumentId)
			locations[l.InstrumentId] = l
		}

		ids := []string{}
		for _, r := range responsible {
			ids = append(ids, r.DepartmentId)
		}

		// при возвращении инструментов я отфильтровываю те что не находятся в том же подразделении что и пользователь
		filtered, err := s.FilterByDepartments(ctx, &models.DepartmentFilterDTO{InstrumentIds: instrumentIds, DepartmentIds: ids})
		if err != nil {
			return false, err
		}

		isFull = len(filtered) == len(dto.Locations)
		if !isFull {
			newLocations := []*models.CreateLocationDTO{}
			for _, l := range filtered {
				newLocations = append(newLocations, locations[l])
			}
			dto.Locations = newLocations
		}
	}

	if len(dto.Locations) == 0 {
		return isFull, models.ErrNoInstrument
	}

	if err := s.repo.CreateSeveral(ctx, dto.Locations); err != nil {
		return isFull, fmt.Errorf("failed to create several locations. error: %w", err)
	}
	return isFull, nil
}

// TODO возможно стоит все-таки вернуть проверку при перемещении инструмента и добавить похожую при подтверждении через приложение
func (s *LocationService) CreateSeveralOld(ctx context.Context, dto *models.CreateSeveralLocationDTO) error {
	if err := s.repo.CreateSeveral(ctx, dto.Locations); err != nil {
		return fmt.Errorf("failed to create several locations. error: %w", err)
	}
	return nil
}

func (s *LocationService) Update(ctx context.Context, location *models.UpdateLocationDTO) error {
	if err := s.repo.Update(ctx, location); err != nil {
		return fmt.Errorf("failed to update si location. error: %w", err)
	}
	return nil
}

func (s *LocationService) UpdatePlace(ctx context.Context, dto *models.UpdatePlaceDTO) error {
	if err := s.repo.UpdatePlace(ctx, dto); err != nil {
		return fmt.Errorf("failed to update place. error: %w", err)
	}
	return nil
}
func (s *LocationService) UpdatePerson(ctx context.Context, dto *models.UpdatePlaceDTO) error {
	if err := s.repo.UpdatePerson(ctx, dto); err != nil {
		return fmt.Errorf("failed to update person. error: %w", err)
	}
	return nil
}

func (s *LocationService) ReceivingFromApp(ctx context.Context, dto *models.ReceivingDTO) error {
	// location := &models.ReceivingDTO{
	// 	Status: dto[0].Status,
	// }
	// ids := []string{}

	// for _, d := range dto {
	// 	ids = append(ids, d.Id)
	// }
	// location.InstrumentIds = ids

	responsible, err := s.responsible.GetBySSOId(ctx, dto.UserId)
	if err != nil {
		return err
	}

	logger.Debug("receiving", logger.StringAttr("status", dto.Status), logger.AnyAttr("responsible", responsible))
	if dto.Status == constants.LocationStatusUsed {
		if len(responsible) == 0 {
			return models.ErrNoResponsible
		}

		ids := []string{}
		for _, r := range responsible {
			ids = append(ids, r.DepartmentId)
		}

		// при подтверждении инструментов я отфильтровываю те что не находятся в том же подразделении что и пользователь
		filtered, err := s.FilterByDepartments(ctx, &models.DepartmentFilterDTO{
			InstrumentIds: dto.InstrumentIds,
			DepartmentIds: ids,
			Status:        constants.LocationStatusMoved,
		})
		if err != nil {
			return err
		}

		isFull := len(filtered) == len(dto.InstrumentIds)
		if !isFull {
			dto.InstrumentIds = filtered
		}
	}

	if len(dto.InstrumentIds) == 0 {
		return models.ErrNoInstrument
	}

	if err := s.repo.Receiving(ctx, dto); err != nil {
		return fmt.Errorf("failed to receiving si location. error: %w", err)
	}
	return nil
}

// Получение инструментов. Запрос прилетает из канала mattermost
func (s *LocationService) Receiving(ctx context.Context, dto *models.DialogResponse) error {
	post := &models.UpdatePostData{}
	InstrumentIds := []string{}

	state := strings.Split(dto.State, "&")
	for _, s := range state {
		arr := strings.SplitN(s, ":", 2)
		switch arr[0] {
		case "PostId":
			post.PostID = arr[1]
		case "Status":
			post.Status = arr[1]
		case "SI":
			err := json.Unmarshal([]byte(arr[1]), &post.Instruments)
			if err != nil {
				return fmt.Errorf("failed to json unmarshal. error: %w", err)
			}
		}
	}

	for k, v := range dto.Submission {
		if v {
			InstrumentIds = append(InstrumentIds, k)
		} else {
			for _, v := range post.Instruments {
				if v.Id == k {
					post.Missing = append(post.Missing, v)
					break
				}
			}
		}
	}

	location := &models.ReceivingDTO{
		// PostID:        PostID,
		InstrumentIds: InstrumentIds,
		// Missing:       missing,
		Status:       post.Status,
		HasConfirmed: true,
	}

	if err := s.repo.Receiving(ctx, location); err != nil {
		return fmt.Errorf("failed to receiving si location. error: %w", err)
	}

	// Обновление сообщения в канале (чтобы там хоть что-то менялось и пользователь видел реакцию на его действия)
	if err := s.most.Update(ctx, post); err != nil {
		return err
	}

	// Отправка сообщения для подтверждения получения оставшихся инструментов
	if len(post.Missing) != 0 {
		not := &models.Notification{
			MostId:    dto.UserID,
			ChannelId: dto.ChannelID,
			Type:      constants.StatusReceiving,
			Status:    post.Status,
			Message:   "Подтвердите получение инструментов",
			SI:        post.Missing,
		}
		if not.Status == constants.LocationStatusReserve {
			not.MostId = ""
			not.ChannelId = dto.ChannelID
		}
		if err := s.most.Send(ctx, not); err != nil {
			return err
		}
	}
	return nil
}

func (s *LocationService) ForcedReceiptMany(ctx context.Context) error {
	logger.Info("Forced receipt si")
	if err := s.repo.ForcedReceiptMany(ctx); err != nil {
		return fmt.Errorf("failed to forced receipt many si. error: %w", err)
	}
	return nil
}
func (s *LocationService) ForcedReceipt(ctx context.Context, dto *models.ForcedReceiptDTO) error {
	if err := s.repo.ForcedReceipt(ctx, dto); err != nil {
		return fmt.Errorf("failed to forced receipt si. error: %w", err)
	}
	return nil
}

func (s *LocationService) Delete(ctx context.Context, id string) error {
	// TODO делать ли тут доп проверку (чтобы можно было удалить только то, что перемещается) для всех кроме админа
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete si location. error: %w", err)
	}
	return nil
}
