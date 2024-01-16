package location

import (
	"errors"
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

type LocationHandlers struct {
	service services.Location
	// TODO botApi
}

func NewLocationHandlers(service services.Location) *LocationHandlers {
	return &LocationHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Location) {
	handlers := NewLocationHandlers(service)

	locations := api.Group("/locations")
	{
		locations.GET("/:instrumentId", handlers.GetLast)
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
		// h.botApi.SendError(c, err.Error(), id)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: location})
}

func (h *LocationHandlers) Create(c *gin.Context) {
	var dto models.CreateLocationDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), dto)
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
		// h.botApi.SendError(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о месте нахождения успешно обновлены"})
}

// TODO проверить эти две функции не получается с ботом проблемы жуткие
func (h *LocationHandlers) Receiving(c *gin.Context) {
	logger.Debug("receiving ", c.Query("instruments"))

	logger.Debug("request ", c.Request)

	// TODO надо как-то определять статус, а еще есть вопрос как я буду получать id инструмента
	var dto models.ReceivingDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	// if err := h.service.Receiving(c, dto); err != nil {
	// 	response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
	// 	// h.botApi.SendError(c, err.Error(), dto)
	// 	return
	// }
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
		return
	}
	c.JSON(http.StatusNoContent, response.IdResponse{})
}
