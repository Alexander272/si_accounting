package receiving

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
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

func Register(api *gin.RouterGroup, service services.Location, ware *middleware.Middleware) {
	handlers := NewReceivingHandlers(service)

	locations := api.Group("/si/locations")
	{
		locations.POST("/receiving", ware.VerifyToken, handlers.Receiving)
		locations.POST("/receiving/dialog", handlers.ReceivingDialog)
		locations.POST("/forced", ware.VerifyToken, ware.CheckPermissions(constants.Location, constants.Write), handlers.ForcedReceipt)
	}
}

func (h *ReceivingHandlers) Receiving(c *gin.Context) {
	dto := &models.ReceivingDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}
	dto.UserId = user.Id
	dto.HasConfirmed = true

	if err := h.service.ReceivingFromApp(c, dto); err != nil {
		if errors.Is(err, models.ErrNoResponsible) {
			response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Вы не являетесь ответственным")
			return
		}
		if errors.Is(err, models.ErrNoInstrument) {
			response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Вы не можете подтвердить получение инструментов")
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Получены инструменты",
		logger.StringAttr("user_id", user.Id),
		logger.StringAttr("user", user.Name),
		logger.StringAttr("status", dto.Status),
		logger.AnyAttr("instruments", dto.InstrumentIds),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
}

// func (h *ReceivingHandlers) Receiving(c *gin.Context) {
// 	// если я буду делать подтверждение по почте там нельзя будет отправлять пост запрос и все нужные данные надо будет передавать в query

// 	//TODO есть проблема инструменты приходят одной кучей, как их принимать если пришла только часть?
// 	// похоже надо как-то делить все что приходит + надо наверное выводить держателя для метролога, чтобы она понимала у кого был инструмент

// 	var dto models.Confirmation
// 	if err := c.BindJSON(&dto); err != nil {
// 		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
// 		return
// 	}

// 	// data := models.ReceivingDTO{
// 	// 	// PostID:        dto.PostID,
// 	// 	InstrumentIds: dto.Context.InstrumentIds,
// 	// 	Status:        dto.Context.Status,
// 	// }

// 	// if err := h.service.Receiving(c, data); err != nil {
// 	// 	response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
// 	// 	h.errBot.Send(c, err.Error(), dto)
// 	// 	return
// 	// }

// 	logger.Info("Получены инструменты",
// 		logger.StringAttr("user_id", dto.UserID),
// 		logger.StringAttr("user", dto.UserName),
// 		logger.StringAttr("instrument_ids", strings.Join(dto.Context.InstrumentIds, ",")),
// 	)

// 	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
// }

func (h *ReceivingHandlers) ReceivingDialog(c *gin.Context) {
	dto := &models.DialogResponse{}
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

func (h *ReceivingHandlers) ForcedReceipt(c *gin.Context) {
	// instrument := c.Query("instrument")
	// if instrument == "" {
	// 	response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
	// 	return
	// }
	dto := &models.ForcedReceiptDTO{}
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.ForcedReceipt(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Получены инструменты (принудительно)",
		logger.StringAttr("instrument_id", dto.InstrumentId),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
}
