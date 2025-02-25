package departments

import (
	"errors"
	"net/http"

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

type DepartmentHandlers struct {
	service services.Department
}

func NewDepartmentHandlers(service services.Department) *DepartmentHandlers {
	return &DepartmentHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Department, middleware *middleware.Middleware) {
	handlers := NewDepartmentHandlers(service)

	departments := api.Group("/departments")
	{
		departments.GET("", middleware.CheckPermissions(constants.Department, constants.Read), handlers.GetAll)
		departments.GET("/:id", middleware.CheckPermissions(constants.Department, constants.Read), handlers.GetById)
		departments.GET("/sso", middleware.CheckPermissions(constants.Department, constants.Read), handlers.GetBySSOId)
		departments.POST("", middleware.CheckPermissions(constants.Department, constants.Write), handlers.Create)
		departments.PUT("/:id", middleware.CheckPermissions(constants.Department, constants.Write), handlers.Update)
		departments.DELETE("/:id", middleware.CheckPermissions(constants.Department, constants.Write), handlers.Delete)
	}
}

func (h *DepartmentHandlers) GetAll(c *gin.Context) {
	departments, err := h.service.GetAll(c)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), nil)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: departments})
}

func (h *DepartmentHandlers) GetById(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id подразделения не задан")
		return
	}

	department, err := h.service.GetById(c, id)
	if err != nil {
		if errors.Is(err, models.ErrNoRows) {
			response.NewErrorResponse(c, http.StatusNotFound, err.Error(), "Подразделение не найдено")
			return
		}
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), id)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: department})
}

func (h *DepartmentHandlers) GetBySSOId(c *gin.Context) {
	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	departments, err := h.service.GetBySSOId(c, user.Id)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), nil)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: departments})
}

func (h *DepartmentHandlers) Create(c *gin.Context) {
	dto := &models.Department{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	realm := c.GetHeader("realm")
	err := uuid.Validate(realm)
	if err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "invalid id param")
		return
	}
	dto.RealmId = realm

	id, err := h.service.Create(c, dto)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	logger.Info("Подразделение создано",
		logger.StringAttr("id", dto.Id),
		logger.StringAttr("name", dto.Name),
		logger.AnyAttr("data", dto),
	)

	c.JSON(http.StatusCreated, response.IdResponse{Id: id, Message: "Новое подразделение создано"})
}

func (h *DepartmentHandlers) Update(c *gin.Context) {
	dto := &models.Department{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id подразделения не задан")
		return
	}
	dto.Id = id

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	logger.Info("Подразделение обновлено",
		logger.StringAttr("id", dto.Id),
		logger.StringAttr("name", dto.Name),
		logger.AnyAttr("data", dto),
	)

	c.JSON(http.StatusOK, response.IdResponse{Message: "Подразделение обновлено"})
}

func (h *DepartmentHandlers) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id подразделения не задан")
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), id)
		return
	}
	logger.Info("Подразделение удалено", logger.StringAttr("id", id))

	c.JSON(http.StatusNoContent, response.StatusResponse{})
}
