package instrument

import (
	"errors"
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type InstrumentHandlers struct {
	service services.Instrument
	// TODO botApi
}

func NewInstrumentHandlers(service services.Instrument) *InstrumentHandlers {
	return &InstrumentHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Instrument) {
	handlers := NewInstrumentHandlers(service)

	instruments := api.Group("/instruments")
	{
		// instruments.GET("")
		instruments.GET("/:id", handlers.GetById)
		instruments.POST("", handlers.Create)
		instruments.PUT("/:id", handlers.Update)
		// instruments.DELETE("/:id")
	}
}

func (h *InstrumentHandlers) GetById(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	instrument, err := h.service.GetById(c, id)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			response.NewErrorResponse(c, http.StatusNotFound, err.Error(), err.Error())
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), id)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: instrument})
}

func (h *InstrumentHandlers) Create(c *gin.Context) {
	var dto models.CreateInstrumentDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusCreated, response.IdResponse{Message: "Данные об инструменте успешно добавлены"})
}

func (h *InstrumentHandlers) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	var dto models.UpdateInstrumentDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	dto.Id = id

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные об инструменте успешно обновлены"})
}
