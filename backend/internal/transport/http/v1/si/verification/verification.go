package verification

import (
	"errors"
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/middleware"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/v1/si/verification/documents"
	"github.com/Alexander272/si_accounting/backend/pkg/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
)

type VerificationHandlers struct {
	service services.Verification
}

func NewVerificationHandlers(service services.Verification) *VerificationHandlers {
	return &VerificationHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Verification, docs services.Documents, middleware *middleware.Middleware) {
	handlers := NewVerificationHandlers(service)

	verifications := api.Group("/verifications")
	{
		verifications.GET("/:instrumentId", middleware.CheckPermissions(constants.Verification, constants.Read), handlers.GetLast)
		verifications.GET("/all/:instrumentId", middleware.CheckPermissions(constants.Verification, constants.Read), handlers.GetByInstrumentId)
		verifications.POST("", middleware.CheckPermissions(constants.Verification, constants.Write), handlers.Create)
		verifications.PUT("/:id", middleware.CheckPermissions(constants.Verification, constants.Write), handlers.Update)
	}
	documents.Register(verifications, docs, middleware)
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
		error_bot.Send(c, err.Error(), instrumentId)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: verification})
}

func (h *VerificationHandlers) GetByInstrumentId(c *gin.Context) {
	instrumentId := c.Param("instrumentId")
	if instrumentId == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	verifications, err := h.service.GetByInstrumentId(c, instrumentId)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), instrumentId)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: verifications})
}

func (h *VerificationHandlers) Create(c *gin.Context) {
	dto := &models.CreateVerificationDTO{}
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	logger.Info("Добавлена поверка",
		logger.StringAttr("user_id", user.Id),
		logger.StringAttr("instrument_id", dto.InstrumentId),
		logger.AnyAttr("verification", dto),
	)

	c.JSON(http.StatusCreated, response.IdResponse{Message: "Данные о поверке успешно добавлены"})
}

func (h *VerificationHandlers) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	dto := &models.UpdateVerificationDTO{}
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	dto.Id = id

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	logger.Info("Поверка обновлена",
		logger.StringAttr("user_id", user.Id),
		logger.StringAttr("instrument_id", dto.InstrumentId),
		logger.StringAttr("verification_id", dto.Id),
		logger.AnyAttr("verification", dto),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о поверке успешно обновлены"})
}
