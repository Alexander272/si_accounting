package error_bot

import (
	"fmt"

	"github.com/Alexander272/si_accounting/backend/internal/models/bot"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type ErrorApi struct {
	service services.ErrorBot
}

func NewErrorBotApi(service services.ErrorBot) *ErrorApi {
	return &ErrorApi{
		service: service,
	}
}

type ErrorBotApi interface {
	Send(*gin.Context, string, interface{})
}

func (h *ErrorApi) Send(c *gin.Context, e string, request interface{}) {
	data := bot.Data{
		Error:   e,
		IP:      c.ClientIP(),
		Url:     fmt.Sprintf("%s %s", c.Request.Method, c.Request.URL.String()),
		Request: request,
	}

	h.service.Send(c, data)
}

// type ErrorApi struct {
// 	URL string
// }

// func NewErrorBotApi(url string, api string) *ErrorApi {
// 	return &ErrorApi{
// 		URL: url + api,
// 	}
// }

// type ErrorBotApi interface {
// 	Send(*gin.Context, string, interface{})
// }

// func (h *ErrorApi) Send(c *gin.Context, e string, request interface{}) {
// 	var data []byte
// 	if request != nil {
// 		var err error
// 		data, err = json.Marshal(request)
// 		if err != nil {
// 			logger.Errorf("failed to marshal request body. error: %s", err.Error())
// 		}
// 	}

// 	message := bot.Message{
// 		Service: bot.Service{
// 			Id:   "sia",
// 			Name: "SI accounting",
// 		},
// 		Data: bot.MessageData{
// 			Date:    time.Now().Format("02/01/2006 - 15:04:05"),
// 			IP:      c.ClientIP(),
// 			URL:     fmt.Sprintf("%s %s", c.Request.Method, c.Request.URL.String()),
// 			Error:   e,
// 			Request: string(data),
// 		},
// 	}

// 	var buf bytes.Buffer
// 	if err := json.NewEncoder(&buf).Encode(message); err != nil {
// 		logger.Errorf("failed to encode struct. error: %s", err.Error())
// 	}

// 	_, err := http.Post(h.URL, "application/json", &buf)
// 	if err != nil {
// 		logger.Errorf("failed to send error to bot. error: %s", err.Error())
// 	}
// }
