package receiving

import (
	"net/http"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/api/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

type ReceivingHandlers struct {
	service services.Location
	errBot  error_bot.ErrorBotApi
}

func NewReceivingHandlers(service services.Location, errBot error_bot.ErrorBotApi) *ReceivingHandlers {
	return &ReceivingHandlers{
		service: service,
		errBot:  errBot,
	}
}

func Register(api *gin.RouterGroup, service services.Location, errBot error_bot.ErrorBotApi) {
	handlers := NewReceivingHandlers(service, errBot)

	locations := api.Group("/locations")
	{
		locations.POST("/receiving", handlers.Receiving)
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

	data := models.ReceivingDTO{
		PostID:        dto.PostID,
		InstrumentIds: dto.Context.InstrumentIds,
		Status:        dto.Context.Status,
	}

	if err := h.service.Receiving(c, data); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), dto)
		return
	}

	logger.Info("Получены инструменты",
		logger.StringAttr("user_id", dto.UserID),
		logger.StringAttr("user", dto.UserName),
		logger.StringAttr("instrument_ids", strings.Join(dto.Context.InstrumentIds, ",")),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
}
