package verification

import (
	"errors"
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/api/error_bot"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/verification/documents"
	"github.com/gin-gonic/gin"
)

type VerificationHandlers struct {
	service services.Verification
	errBot  error_bot.ErrorBotApi
}

func NewVerificationHandlers(service services.Verification, errBot error_bot.ErrorBotApi) *VerificationHandlers {
	return &VerificationHandlers{
		service: service,
		errBot:  errBot,
	}
}

func Register(api *gin.RouterGroup, service services.Verification, docs services.Documents, errBot error_bot.ErrorBotApi) {
	handlers := NewVerificationHandlers(service, errBot)

	verifications := api.Group("/verifications")
	{
		verifications.GET("/:instrumentId", handlers.GetLast)
		verifications.POST("", handlers.Create)
		verifications.PUT("/:id", handlers.Update)
	}
	documents.Register(verifications, docs, errBot)
}

func (h *VerificationHandlers) GetLast(c *gin.Context) {
	instrumentId := c.Param("instrumentId")
	if instrumentId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	verification, err := h.service.GetLast(c, instrumentId)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			response.NewErrorResponse(c, http.StatusNotFound, err.Error(), err.Error())
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), instrumentId)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: verification})
}

func (h *VerificationHandlers) Create(c *gin.Context) {
	var dto models.CreateVerificationDTO
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusCreated, response.IdResponse{Message: "Данные о поверке успешно добавлены"})
}

func (h *VerificationHandlers) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	var dto models.UpdateVerificationDTO
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
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о поверке успешно обновлены"})
}
