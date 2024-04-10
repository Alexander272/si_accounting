package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

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
	Send(context.Context, models.Notification) error
	Update(context.Context, string) error
}

func (s *MostService) Send(ctx context.Context, not models.Notification) error {
	var post models.CreatePostDTO
	apiPath := "/api/send"

	table := []string{
		"| Наименование СИ | зав.№ | Держатель |",
		"|:--|:--|:--|",
	}

	instrumentIds := []string{}

	for _, si := range not.SI {
		instrumentIds = append(instrumentIds, si.Id)
		table = append(table, fmt.Sprintf("|%s|%s|%s|", si.Name, si.FactoryNumber, si.Person))
	}

	post.Message = strings.Join(table, "\n")
	if not.Message != "" {
		post.Message = fmt.Sprintf("#### %s\n%s", not.Message, post.Message)
	}
	post.UserId = not.MostId
	post.Props = []*models.Props{
		{Key: "service", Value: "sia"},
	}

	if not.Type == "receiving" {
		url := os.Getenv("HOST_URL") + "/api/v1/si/locations/receiving"

		action := &model.PostAction{
			Id:    "all",
			Name:  "Получено",
			Style: "primary",
			Integration: &model.PostActionIntegration{
				URL: url,
				Context: map[string]interface{}{
					"type":          "receiving",
					"status":        not.Status,
					"instrumentIds": instrumentIds,
				},
			},
		}

		post.Actions = []*model.PostAction{action}
	}

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

func (s *MostService) Update(ctx context.Context, postId string) error {
	var post models.UpdatePostDTO
	apiPath := fmt.Sprintf("/api/send/%s", postId)

	post.Message = "#### Инструменты получены"
	post.Props = []*models.Props{
		{Key: "service", Value: "sia"},
	}

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(post); err != nil {
		return fmt.Errorf("failed to encode notification data. error: %w", err)
	}

	_, err := http.Post(s.url+apiPath, "application/json", &buf)
	if err != nil {
		return fmt.Errorf("failed to send data to bot. error: %w", err)
	}
	return nil
}
