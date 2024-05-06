package receiving

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/middleware"
	"github.com/Alexander272/si_accounting/backend/pkg/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

type ReceivingHandlers struct {
	service services.Location
}

func NewReceivingHandlers(service services.Location) *ReceivingHandlers {
	return &ReceivingHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Location, middleware *middleware.Middleware) {
	handlers := NewReceivingHandlers(service)

	locations := api.Group("/si/locations")
	{
		locations.POST("/receiving", handlers.Receiving)
		locations.POST("/receiving/dialog", handlers.ReceivingDialog)
	}
}

func (h *ReceivingHandlers) Receiving(c *gin.Context) {
	// если я буду делать подтверждение по почте там нельзя будет отправлять пост запрос и все нужные данные надо будет передавать в query

	//TODO есть проблема инструменты приходят одной кучей, как их принимать если пришла только часть?
	// похоже надо как-то делить все что приходит + надо наверное выводить держателя для метролога, чтобы она понимала у кого был инструмент

	var dto models.Confirmation
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	// data := models.ReceivingDTO{
	// 	// PostID:        dto.PostID,
	// 	InstrumentIds: dto.Context.InstrumentIds,
	// 	Status:        dto.Context.Status,
	// }

	// if err := h.service.Receiving(c, data); err != nil {
	// 	response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
	// 	h.errBot.Send(c, err.Error(), dto)
	// 	return
	// }

	logger.Info("Получены инструменты",
		logger.StringAttr("user_id", dto.UserID),
		logger.StringAttr("user", dto.UserName),
		logger.StringAttr("instrument_ids", strings.Join(dto.Context.InstrumentIds, ",")),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
}

func (h *ReceivingHandlers) ReceivingDialog(c *gin.Context) {
	var dto models.DialogResponse
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	// instruments := []models.SelectedSI{}
	// InstrumentIds, missing := []string{}, []models.SelectedSI{}
	// PostID, Status := "", ""
	// state := strings.Split(dto.State, "&")
	// for _, s := range state {
	// 	arr := strings.SplitN(s, ":", 2)
	// 	switch arr[0] {
	// 	case "PostId":
	// 		PostID = arr[1]
	// 	case "Status":
	// 		Status = arr[1]
	// 	case "SI":
	// 		err := json.Unmarshal([]byte(arr[1]), &instruments)
	// 		if err != nil {
	// 			response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
	// 			return
	// 		}
	// 	}
	// }

	// for k, v := range dto.Submission {
	// 	if v {
	// 		InstrumentIds = append(InstrumentIds, k)
	// 	} else {
	// 		for _, v := range instruments {
	// 			if v.Id == k {
	// 				missing = append(missing, v)
	// 				break
	// 			}
	// 		}
	// 	}
	// }

	// data := models.ReceivingDTO{
	// 	PostID:        PostID,
	// 	InstrumentIds: InstrumentIds,
	// 	Missing:       missing,
	// 	Status:        Status,
	// }

	if err := h.service.Receiving(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Получены инструменты",
		logger.StringAttr("user_id", dto.UserID),
		logger.StringAttr("instrument_ids", fmt.Sprint(dto.Submission)),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
}
