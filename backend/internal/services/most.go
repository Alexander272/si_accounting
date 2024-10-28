package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/goccy/go-json"
	"github.com/mattermost/mattermost-server/v6/model"
)

type MostService struct {
	url string
}

func NewMostService(url string) *MostService {
	return &MostService{
		url: url,
	}
}

type Most interface {
	Send(context.Context, *models.Notification) error
	Update(context.Context, *models.UpdatePostData) error
}

// func (s *MostService) GetPost(ctx context.Context, id string) (model.Post, error) {

// }

func (s *MostService) Send(ctx context.Context, not *models.Notification) error {
	post := &models.CreatePostDTO{}
	apiPath := "/api/posts"
	apiDialogsPath := "/api/dialogs"

	//TODO может разделить на несколько функций для каждого варианта использования

	table := []string{
		"| Наименование СИ | зав.№ | Держатель |",
		"|:--|:--|:--|",
	}

	instrumentIds := []string{}
	fields := []models.FormField{}

	for _, si := range not.SI {
		instrumentIds = append(instrumentIds, si.Id)
		table = append(table, fmt.Sprintf("|%s|%s|%s|", si.Name, si.FactoryNumber, si.Person))

		fields = append(fields, models.FormField{
			Id:       si.Id,
			Title:    fmt.Sprintf("%s (%s)", si.Name, si.FactoryNumber),
			Name:     "Инструмент получен",
			Type:     "bool",
			Default:  "true",
			Optional: true,
		})
	}

	post.Message = strings.Join(table, "\n")
	if not.Message != "" {
		post.Message = fmt.Sprintf("#### %s\n%s", not.Message, post.Message)
	}
	post.UserId = not.MostId
	post.ChannelId = not.ChannelId
	// post.IsPinned = true
	post.IsPinned = not.Type == constants.StatusReceiving
	//TODO возможно в data_id стоит не только id инструментов передавать, но и тип функции (сообщения)
	post.Props = []*models.Props{
		{Key: "service", Value: "sia"},
		{Key: "data_id", Value: strings.Join(instrumentIds, ",")},
	}

	if not.Type == constants.StatusReceiving {
		url := os.Getenv("HOST_URL") + "/api/v1/si/locations/receiving/dialog"

		// action := &model.PostAction{
		// 	Id:    "all",
		// 	Name:  "Получено",
		// 	Style: "primary",
		// 	Integration: &model.PostActionIntegration{
		// 		URL: url,
		// 		Context: map[string]interface{}{
		// 			"type":          "receiving",
		// 			"status":        not.Status,
		// 			"instrumentIds": instrumentIds,
		// 		},
		// 	},
		// }

		j, err := json.Marshal(not.SI)
		if err != nil {
			return fmt.Errorf("failed to marshal json. error: %w", err)
		}

		action := &model.PostAction{
			Id:    constants.StatusReceiving,
			Name:  "Получить",
			Style: "primary",
			Integration: &model.PostActionIntegration{
				URL: s.url + apiDialogsPath,
				Context: map[string]interface{}{
					"url":         url,
					"title":       "Получение инструментов",
					"description": "#### Отметьте полученные инструменты",
					"callbackId":  "receiving_form",
					"state":       fmt.Sprintf("Status:%s&SI:%s", not.Status, string(j)),
					"fields":      fields,
				},
			},
		}

		post.Actions = []*model.PostAction{action}
	}

	// var post models.CreatePostDTO
	// apiPath := "/api/posts"

	// message, actions, err := s.GeneratePost(ctx, not)
	// if err != nil {
	// 	return err
	// }
	// post.Message = message
	// post.Actions = actions
	// post.UserId = not.MostId
	// post.Props = []*models.Props{
	// 	{Key: "service", Value: "sia"},
	// }

	// j, _ := json.Marshal(post)
	// logger.Debug(string(j))

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(post); err != nil {
		return fmt.Errorf("failed to encode notification data. error: %w", err)
	}

	resp, err := http.Post(s.url+apiPath, "application/json", &buf)
	if err != nil {
		return fmt.Errorf("failed to send data to bot. error: %w", err)
	}

	if !strings.HasPrefix(resp.Status, "2") {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("client: could not read response body: %w", err)
		}

		return fmt.Errorf("request returned an error: %s", string(body))
	}

	return nil
}

func (s *MostService) Update(ctx context.Context, dto *models.UpdatePostData) error {
	post := &models.UpdatePostDTO{}
	apiPath := fmt.Sprintf("/api/posts/%s", dto.PostID)

	// if len(dto.Missing) != 0 {
	// 	message, actions, err := s.GeneratePost(ctx, models.Notification{
	// 		Type:    constants.StatusReceiving,
	// 		Status:  dto.Status,
	// 		SI:      dto.Missing,
	// 		Message: "Подтвердите получение инструментов",
	// 	})
	// 	if err != nil {
	// 		return err
	// 	}

	// 	post.Message = message
	// 	post.Actions = actions
	// } else {

	// получение списка полученных инструментов
	for _, m := range dto.Missing {
		index := -1
		for i, si := range dto.Instruments {
			if si.Id == m.Id {
				index = i
				break
			}
		}
		if index != -1 {
			dto.Instruments = append(dto.Instruments[:index], dto.Instruments[index+1:]...)
		}
	}

	lines := []string{
		"| Наименование СИ | зав.№ | Держатель |",
		"|:--|:--|:--|",
	}

	for _, si := range dto.Instruments {
		lines = append(lines, fmt.Sprintf("|%s|%s|%s|", si.Name, si.FactoryNumber, si.Person))
	}

	post.Message = "#### Получены инструменты \n" + strings.Join(lines, "\n")
	// }

	post.PostId = dto.PostID
	post.Props = []*models.Props{
		{Key: "service", Value: "sia"},
	}

	// j, _ := json.Marshal(post)
	// logger.Debug("post ", string(j))

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(post); err != nil {
		return fmt.Errorf("failed to encode notification data. error: %w", err)
	}

	req, err := http.NewRequest(http.MethodPut, s.url+apiPath, &buf)
	if err != nil {
		return fmt.Errorf("failed to create request. error: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	_, err = http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send data to bot. error: %w", err)
	}
	return nil
}

// func (s *MostService) GeneratePost(ctx context.Context, dto models.Notification) (message string, actions []*model.PostAction, err error) {
// 	apiDialogsPath := "/api/dialogs"

// 	table := []string{
// 		"| Наименование СИ | зав.№ | Держатель |",
// 		"|:--|:--|:--|",
// 	}

// 	instrumentIds := []string{}
// 	fields := []models.FormField{}

// 	for _, si := range dto.SI {
// 		instrumentIds = append(instrumentIds, si.Id)
// 		table = append(table, fmt.Sprintf("|%s|%s|%s|", si.Name, si.FactoryNumber, si.Person))

// 		fields = append(fields, models.FormField{
// 			Id:       si.Id,
// 			Title:    fmt.Sprintf("%s (%s)", si.Name, si.FactoryNumber),
// 			Name:     "Инструмент получен",
// 			Type:     "bool",
// 			Default:  "true",
// 			Optional: true,
// 		})
// 	}

// 	message = strings.Join(table, "\n")
// 	if dto.Message != "" {
// 		message = fmt.Sprintf("#### %s\n%s", dto.Message, message)
// 	}

// 	if dto.Type == constants.StatusReceiving {
// 		url := os.Getenv("HOST_URL") + "/api/v1/si/locations/receiving"

// 		action := &model.PostAction{
// 			Id:    "all",
// 			Name:  "Получено",
// 			Style: "primary",
// 			Integration: &model.PostActionIntegration{
// 				URL: url,
// 				Context: map[string]interface{}{
// 					"type":          constants.StatusReceiving,
// 					"status":        dto.Status,
// 					"instrumentIds": instrumentIds,
// 				},
// 			},
// 		}

// 		j, err := json.Marshal(dto.SI)
// 		if err != nil {
// 			return "", nil, fmt.Errorf("failed to marshal json. error: %w", err)
// 		}

// 		testAction := &model.PostAction{
// 			Id:    "receiving",
// 			Name:  "Получить",
// 			Style: "primary",
// 			Integration: &model.PostActionIntegration{
// 				URL: s.url + apiDialogsPath,
// 				Context: map[string]interface{}{
// 					"url":         url + "/dialog",
// 					"title":       "Получение инструментов",
// 					"description": "#### Отметьте полученные инструменты",
// 					"callbackId":  "receiving_form",
// 					"state":       fmt.Sprintf("Status:%s&SI:%s", dto.Status, string(j)),
// 					"fields":      fields,
// 				},
// 			},
// 		}

// 		actions = []*model.PostAction{action, testAction}
// 	}

// 	return message, actions, nil
// }
