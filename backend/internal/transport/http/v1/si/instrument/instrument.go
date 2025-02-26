package instrument

import (
	"errors"
	"net/http"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/middleware"
	"github.com/Alexander272/si_accounting/backend/pkg/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type InstrumentHandlers struct {
	service services.Instrument
}

func NewInstrumentHandlers(service services.Instrument) *InstrumentHandlers {
	return &InstrumentHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Instrument, middleware *middleware.Middleware) {
	handlers := NewInstrumentHandlers(service)

	instruments := api.Group("/instruments")
	{
		instruments.GET("", middleware.CheckPermissions(constants.SI, constants.Read), handlers.Get)
		instruments.GET("/:id", middleware.CheckPermissions(constants.SI, constants.Read), handlers.GetById)
		instruments.POST("", middleware.CheckPermissions(constants.SI, constants.Write), handlers.Create)
		instruments.PUT("/:id", middleware.CheckPermissions(constants.SI, constants.Write), handlers.Update)
		instruments.DELETE("/:id", middleware.CheckPermissions(constants.SI, constants.Write), handlers.Delete)
	}
}

func (h *InstrumentHandlers) Get(c *gin.Context) {
	// по хорошему надо сделать нормальный фильтр, но пока хватит и этого
	tmp := c.Query("instruments")
	if tmp == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "ids не заданы")
		return
	}
	ids := strings.Split(tmp, ",")

	instruments, err := h.service.Get(c, &models.GetInstrumentsDTO{IDs: ids})
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), ids)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: instruments})
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
		error_bot.Send(c, err.Error(), id)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: instrument})
}

func (h *InstrumentHandlers) Create(c *gin.Context) {
	dto := &models.CreateInstrumentDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	realm := c.GetHeader("realm")
	err := uuid.Validate(realm)
	if err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Сессия не найдена")
		return
	}
	dto.RealmId = realm

	id, err := h.service.Create(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	u, exists := c.Get(constants.CtxUser)
	if !exists {
		response.NewErrorResponse(c, http.StatusUnauthorized, "empty user", "Сессия не найдена")
		return
	}
	user := u.(models.User)

	logger.Info("Создан инструмент",
		logger.StringAttr("user_id", user.Id),
		logger.StringAttr("instrument_id", id),
		logger.StringAttr("instrument_name", dto.Name),
		logger.AnyAttr("instrument", dto),
	)

	c.JSON(http.StatusCreated, response.IdResponse{Message: "Данные об инструменте успешно добавлены"})
}

func (h *InstrumentHandlers) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	dto := &models.UpdateInstrumentDTO{}
	if err := c.BindJSON(dto); err != nil {
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

	logger.Info("Инструмент обновлен",
		logger.StringAttr("user_id", user.Id),
		logger.StringAttr("instrument_id", dto.Id),
		logger.StringAttr("instrument_name", dto.Name),
		logger.AnyAttr("instrument", dto),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные об инструменте успешно обновлены"})
}

func (h *InstrumentHandlers) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "id не задан")
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), id)
		return
	}

	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	logger.Info("Инструмент отмечен как удаленный", logger.StringAttr("instrument_id", id), logger.StringAttr("user_id", user.Id))

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные об инструменте успешно удалены"})
}
