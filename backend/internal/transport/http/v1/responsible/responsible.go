package responsible

import (
	"net/http"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/middleware"
	"github.com/Alexander272/si_accounting/backend/pkg/error_bot"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service services.Responsible
}

func NewHandler(service services.Responsible) *Handler {
	return &Handler{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.Responsible, middleware *middleware.Middleware) {
	handler := NewHandler(service)

	responsible := api.Group("/responsible")
	{
		responsible.GET("", middleware.CheckPermissions(constants.Users, constants.Read), handler.getAll)
		responsible.GET("/sso", middleware.CheckPermissions(constants.Users, constants.Read), handler.getBySSO)
		responsible.POST("/change", middleware.CheckPermissions(constants.Users, constants.Write), handler.change)
		responsible.POST("", middleware.CheckPermissions(constants.Users, constants.Write), handler.create)
		responsible.PUT("/:id", middleware.CheckPermissions(constants.Users, constants.Write), handler.update)
		responsible.DELETE("/:id", middleware.CheckPermissions(constants.Users, constants.Write), handler.delete)
	}
}

func (h *Handler) getAll(c *gin.Context) {
	req := &models.GetResponsibleDTO{}

	department := c.Query("department")
	if department != "" {
		req.DepartmentId = department
	}
	ssoId := c.Query("sso")
	if ssoId != "" {
		req.SSOId = ssoId
	}

	data, err := h.service.Get(c, req)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), nil)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data})
}

func (h *Handler) getBySSO(c *gin.Context) {
	// id := c.Param("id")
	// if id == "" {
	// 	response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id пользователя не задан")
	// 	return
	// }
	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	data, err := h.service.GetBySSOId(c, user.Id)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), user)
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: data})
}

func (h *Handler) change(c *gin.Context) {
	dto := &models.ChangeResponsibleDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Некорректные данные")
		return
	}

	if err := h.service.Change(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Пользователь обновлен"})
}

func (h *Handler) create(c *gin.Context) {
	dto := &models.ResponsibleDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Некорректные данные")
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusCreated, response.IdResponse{Message: "Данные созданы"})
}

func (h *Handler) update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id пользователя не задан")
		return
	}

	dto := &models.ResponsibleDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Некорректные данные")
		return
	}
	dto.Id = id

	if err := h.service.Update(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные обновлены"})
}

func (h *Handler) delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Id пользователя не задан")
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), id)
		return
	}
	c.JSON(http.StatusNoContent, response.IdResponse{})
}
