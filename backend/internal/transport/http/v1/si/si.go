package si

import (
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type SIHandlers struct {
	service services.SI
}

func NewSIHandlers(service services.SI) *SIHandlers {
	return &SIHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.SI) {
	handlers := NewSIHandlers(service)

	api.GET("", handlers.GetAll)
	api.POST("/save", handlers.Save)
}

func (h *SIHandlers) GetAll(c *gin.Context) {
	params := models.SIParams{}

	si, err := h.service.GetAll(c, params)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), dto)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: si})
}

func (h *SIHandlers) Save(c *gin.Context) {
	var dto models.UpdateStatus
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Save(c, dto.Id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		// h.botApi.SendError(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о си успешно сохранены"})
}
