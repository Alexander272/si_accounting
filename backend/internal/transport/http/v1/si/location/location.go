package location

import (
	"errors"
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/api/error_bot"
	"github.com/gin-gonic/gin"
)

type LocationHandlers struct {
	service services.Location
	errBot  error_bot.ErrorBotApi
}

func NewLocationHandlers(service services.Location, errBot error_bot.ErrorBotApi) *LocationHandlers {
	return &LocationHandlers{
		service: service,
		errBot:  errBot,
	}
}

func Register(api *gin.RouterGroup, service services.Location, errBot error_bot.ErrorBotApi) {
	handlers := NewLocationHandlers(service, errBot)

	locations := api.Group("/locations")
	{
		locations.GET("/:instrumentId", handlers.GetLast)
		locations.GET("/all/:instrumentId", handlers.GetByInstrumentId)
		locations.POST("", handlers.Create)
		locations.PUT("/:id", handlers.Update)
		locations.POST("/receiving", handlers.Receiving)
		locations.DELETE("/:id", handlers.Delete)
	}
}

func (h *LocationHandlers) GetLast(c *gin.Context) {
	instrumentId := c.Param("instrumentId")
	if instrumentId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	location, err := h.service.GetLast(c, instrumentId)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			response.NewErrorResponse(c, http.StatusNotFound, err.Error(), err.Error())
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), instrumentId)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: location})
}

func (h *LocationHandlers) GetByInstrumentId(c *gin.Context) {
	instrumentId := c.Param("instrumentId")
	if instrumentId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	locations, err := h.service.GetByInstrumentId(c, instrumentId)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), instrumentId)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: locations})
}

func (h *LocationHandlers) Create(c *gin.Context) {
	var dto models.CreateLocationDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusCreated, response.IdResponse{Message: "Данные о месте нахождения успешно добавлены"})
}

func (h *LocationHandlers) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	var dto models.UpdateLocationDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	dto.Id = id

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
}

// TODO можно это вынести в отдельный пакет notification и там уже можно будет сделать подтверждение из почты и с защитой будет проще
func (h *LocationHandlers) Receiving(c *gin.Context) {
	// если я буду делать подтверждение по почте там нельзя будет отправлять пост запрос и все нужные данные надо будет передавать в query

	//TODO есть проблема инструменты приходят одной кучей, как их принимать если пришла только часть?
	// похоже надо как-то делить все что приходит + надо наверное выводить держателя для метролога, чтобы она понимала у кого был инструмент

	var dto models.Confirmation
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	data := models.ReceivingDTO{
		InstrumentIds: dto.Context.InstrumentIds,
		Status:        dto.Context.Status,
	}

	if err := h.service.Receiving(c, data); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
}

func (h *LocationHandlers) ReceivingFromBot(c *gin.Context) {
	var dto models.ReceivingFromBotDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

}

func (h *LocationHandlers) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), id)
		return
	}
	c.JSON(http.StatusNoContent, response.IdResponse{})
}
