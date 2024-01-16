package services

// import (
// 	"context"
// 	"fmt"

// 	"github.com/Alexander272/si_accounting/backend/internal/models"
// 	"github.com/mattermost/mattermost-server/v6/model"
// )

// type MostService struct {
// 	URL string
// }

// func NewMostService(url string) *MostService {
// 	return &MostService{
// 		URL: url,
// 	}
// }

// type Most interface{}

// func (s *MostService) SendNotification(ctx context.Context, notification models.Notification) error {
// 	attachment := &model.SlackAttachment{
// 		Fields: []*model.SlackAttachmentField{
// 			{
// 				Title: "Инструмент",
// 				Short: true,
// 			},
// 		},
// 		Actions: []*model.PostAction{},
// 	}

// 	nameField := &model.SlackAttachmentField{
// 		Title: "ФИО держателя",
// 		Short: true,
// 	}
// 	if notification.Type == "receiving" {
// 		nameField.Title = "ФИО получателя"
// 	}
// 	attachment.Fields = append(attachment.Fields, nameField)

// 	instrumentsId := []string{}

// 	for _, ss := range notification.SI {
// 		instrumentsId = append(instrumentsId, ss.Id)

// 		attachment.Fields = append(attachment.Fields,
// 			&model.SlackAttachmentField{
// 				Title: ss.Name,
// 				Value: ss.FactoryNumber,
// 				Short: true,
// 			},
// 			&model.SlackAttachmentField{
// 				Title: ss.Person,
// 				Short: true,
// 			},
// 		)
// 	}

// 	if notification.Type == "receiving" {
// 		attachment.Actions = append(attachment.Actions,
// 			&model.PostAction{
// 				Id:   "all",
// 				Name: "Получено",
// 				// Style: ,
// 				Integration: &model.PostActionIntegration{},
// 			},
// 			// &model.PostAction{
// 			// 	Id:          "part",
// 			// 	Name:        "",
// 			// 	Integration: &model.PostActionIntegration{},
// 			// },
// 		)

// 	}

// 	return fmt.Errorf("not implement")
// }
