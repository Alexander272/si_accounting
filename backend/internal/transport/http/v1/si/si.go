package si

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/middleware"
	"github.com/Alexander272/si_accounting/backend/pkg/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
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

func Register(api *gin.RouterGroup, service services.SI, middleware *middleware.Middleware) {
	handlers := NewSIHandlers(service)

	api.GET("", middleware.CheckPermissions(constants.SI, constants.Read), handlers.GetAll)
	api.GET("/moved", middleware.CheckPermissions(constants.SI, constants.Read), handlers.GetMoved)
	api.GET("/notification", middleware.CheckPermissions(constants.SI, constants.Write), handlers.GetForNotification)
	api.POST("/save", middleware.CheckPermissions(constants.SI, constants.Write), handlers.Save)
	api.POST("", middleware.CheckPermissions(constants.SI, constants.Write), handlers.Create)
}

func (h *SIHandlers) GetAll(c *gin.Context) {
	params := &models.SIParams{
		Page:    &models.SIPage{},
		Sort:    []*models.SISort{},
		Filters: []*models.SIFilter{},
	}

	page := c.Query("page")
	size := c.Query("size")

	sortLine := c.Query("sort_by")
	filters := c.QueryMap("filters")

	limit, err := strconv.Atoi(size)
	if err != nil {
		params.Page.Limit = 15
	} else {
		params.Page.Limit = limit
	}

	p, err := strconv.Atoi(page)
	if err != nil {
		params.Page.Offset = 0
	} else {
		params.Page.Offset = (p - 1) * params.Page.Limit
	}

	if sortLine != "" {
		sort := strings.Split(sortLine, ",")
		for _, v := range sort {
			field, found := strings.CutPrefix(v, "-")
			t := "ASC"
			if found {
				t = "DESC"
			}

			params.Sort = append(params.Sort, &models.SISort{
				Field: field,
				Type:  t,
			})
		}
	}

	// можно сделать массив с именами полей, а потом передавать для каждого поля значение фильтра, например
	// filter[0]=nextVerificationDate&nextVerificationDate[lte]=somevalue&nextVerificationDate[qte]=somevalue&filter[1]=name&name[eq]=somevalue
	// qte - >=; lte - <=
	// нужен еще тип как-то передать
	// как вариант можно передать filter[nextVerificationDate]=date, filter[name]=string
	// только надо проверить как это все будет читаться на сервере и записываться на клиенте

	// можно сделать следующие варианты compareType (это избавит от необходимости знать тип поля)
	// number or date: eq, qte, lte
	// string: like, con, start, end
	// list: in

	for k, v := range filters {
		valueMap := c.QueryMap(k)

		values := []*models.SIFilterValue{}
		for key, value := range valueMap {
			if k == "place" {
				statusFilter := &models.SIFilter{Field: "status", FieldType: "list", Values: []*models.SIFilterValue{{CompareType: "in"}}}
				tmp := []string{}
				if strings.Contains(value, "_reserve") {
					tmp = append(tmp, "reserve")
				}
				if strings.Contains(value, "_moved") {
					tmp = append(tmp, "moved")
				}
				statusFilter.Values[0].Value = strings.Join(tmp, ",")
				params.Filters = append(params.Filters, statusFilter)

				value = strings.Replace(value, "_reserve", "", -1)
				value = strings.Replace(value, "_moved", "", -1)
				value = strings.Trim(value, ",")
				k = "department"

				if value != "" {
					// params.Filters = append(params.Filters, &models.SIFilter{Field: "last_place", Values: []*models.SIFilterValue{}})
					values = append(values, &models.SIFilterValue{CompareType: key, Value: value})
				}
			}

			values = append(values, &models.SIFilterValue{
				CompareType: key,
				Value:       value,
			})
		}
		if values[0].Value == "" {
			continue
		}

		f := &models.SIFilter{
			Field:     k,
			FieldType: v,
			Values:    values,
		}

		params.Filters = append(params.Filters, f)
	}

	status := c.Query("status")
	if status == "" {
		params.Status = constants.InstrumentStatusWork
	} else {
		switch status {
		case "work":
			params.Status = constants.InstrumentStatusWork
		case "repair":
			params.Status = constants.InstrumentStatusRepair
		case "decommissioning":
			params.Status = constants.InstrumentStatusDec
		}
	}

	si, err := h.service.GetAll(c, params)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), params)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: si.SI, Total: si.Total})
}

func (h *SIHandlers) GetMoved(c *gin.Context) {
	params := &models.SIParams{
		// Page:    &models.SIPage{},
		// Sort:    []*models.SISort{},
		Filters: []*models.SIFilter{},
	}

	filters := c.QueryMap("filters")
	for k, v := range filters {
		valueMap := c.QueryMap(k)

		values := []*models.SIFilterValue{}
		for key, value := range valueMap {
			values = append(values, &models.SIFilterValue{
				CompareType: key,
				Value:       value,
			})
		}

		if k == "place" {
			k = "department"
		}

		f := &models.SIFilter{
			Field:     k,
			FieldType: v,
			Values:    values,
		}
		params.Filters = append(params.Filters, f)
	}

	si, err := h.service.GetMoved(c, params)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), params)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: si.SI, Total: si.Total})
}

func (h *SIHandlers) GetForNotification(c *gin.Context) {
	period := &models.Period{}
	start := c.Query("start")
	end := c.Query("end")

	period.StartAt, _ = strconv.ParseInt(start, 10, 64)
	period.FinishAt, _ = strconv.ParseInt(end, 10, 64)
	// now := time.Now()
	// startAt := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())
	// finishAt := time.Date(now.Year(), now.Month()+2, 0, 0, 0, 0, 0, now.Location())

	// period := &models.Period{
	// 	StartAt:  startAt.Unix(),
	// 	FinishAt: finishAt.Unix(),
	// }

	si, err := h.service.GetForNotification(c, period)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		return
	}
	c.JSON(http.StatusOK, response.DataResponse{Data: si})
}

// func (h *SIHandlers) GetIdentifiers(c *gin.Context) {

// }

func (h *SIHandlers) Save(c *gin.Context) {
	dto := &models.UpdateStatus{}
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Save(c, dto.Id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	var user models.User
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	logger.Info("СИ сохранено (перемещено из черновиков)", logger.StringAttr("instrument_id", dto.Id), logger.StringAttr("user_id", user.Id))

	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о си успешно сохранены"})
}

func (h *SIHandlers) Create(c *gin.Context) {
	dto := &models.CreateSIDTO{}
	if err := c.BindJSON(dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные. error: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	if err := h.service.Create(c, dto); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), dto)
		return
	}

	user := models.User{}
	u, exists := c.Get(constants.CtxUser)
	if exists {
		user = u.(models.User)
	}

	logger.Info("СИ сохранено",
		logger.StringAttr("user_id", user.Id),
		logger.AnyAttr("instrument-dto", dto.Instrument),
		logger.AnyAttr("verification-dto", dto.Verification),
		logger.AnyAttr("location-dto", dto.Location),
	)
	c.JSON(http.StatusCreated, response.IdResponse{Message: "Данные о си успешно сохранены"})
}

// func (h *SIHandlers) GetForNotification(c *gin.Context) {
// 	start := c.Query("start")
// 	end := c.Query("end")

// 	list, err := h.service.GetForNotification(c, models.Period{StartAt: start, FinishAt: end})
// 	if err != nil {
// 		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
// 		return
// 	}
// 	c.JSON(http.StatusOK, response.DataResponse{Data: list})
// }
