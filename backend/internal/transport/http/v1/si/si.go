package si

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/api/error_bot"
	"github.com/gin-gonic/gin"
)

type SIHandlers struct {
	service      services.SI
	errBot       error_bot.ErrorBotApi
	formatFields map[string]string
}

func NewSIHandlers(service services.SI, errBot error_bot.ErrorBotApi) *SIHandlers {
	format := make(map[string]string)

	format["name"] = "name"
	format["type"] = "type"
	format["factoryNumber"] = "factory_number"
	format["measurementLimits"] = "measurement_limits"
	format["accuracy"] = "accuracy"
	format["stateRegister"] = "state_register"
	format["manufacturer"] = "manufacturer"
	format["yearOfIssue"] = "year_of_issue"
	format["interVerificationInterval"] = "inter_verification_interval"
	format["notes"] = "notes"
	format["verificationDate"] = "date"
	format["nextVerificationDate"] = "next_date"
	format["place"] = "department_id"

	return &SIHandlers{
		service:      service,
		errBot:       errBot,
		formatFields: format,
	}
}

func Register(api *gin.RouterGroup, service services.SI, errBot error_bot.ErrorBotApi) {
	handlers := NewSIHandlers(service, errBot)

	api.GET("", handlers.GetAll)
	api.POST("/save", handlers.Save)
	// api.GET("/notification", handlers.GetForNotification)
}

func (h *SIHandlers) GetAll(c *gin.Context) {
	params := models.SIParams{}

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

			params.Sort = append(params.Sort, models.SISort{
				Field: h.formatFields[field],
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

		values := []models.SIFilterValue{}
		for key, value := range valueMap {
			values = append(values, models.SIFilterValue{
				CompareType: key,
				Value:       value,
			})
		}

		f := models.SIFilter{
			Field:     h.formatFields[k],
			FieldType: v,
			Values:    values,
		}

		params.Filters = append(params.Filters, f)
	}

	si, err := h.service.GetAll(c, params)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), params)
		return
	}

	c.JSON(http.StatusOK, response.DataResponse{Data: si.SI, Total: si.Total})
}

// func (h *SIHandlers) GetIdentifiers(c *gin.Context) {

// }

func (h *SIHandlers) Save(c *gin.Context) {
	var dto models.UpdateStatus
	if err := c.BindJSON(&dto); err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, err.Error(), "Отправлены некорректные данные")
		return
	}

	if err := h.service.Save(c, dto.Id); err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		h.errBot.Send(c, err.Error(), dto)
		return
	}
	c.JSON(http.StatusOK, response.IdResponse{Message: "Данные о си успешно сохранены"})
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
