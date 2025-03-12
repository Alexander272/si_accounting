package file

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/Alexander272/si_accounting/backend/internal/constants"
	"github.com/Alexander272/si_accounting/backend/internal/models"
	"github.com/Alexander272/si_accounting/backend/internal/models/response"
	"github.com/Alexander272/si_accounting/backend/internal/services"
	"github.com/Alexander272/si_accounting/backend/internal/transport/http/middleware"
	"github.com/Alexander272/si_accounting/backend/pkg/error_bot"
	"github.com/Alexander272/si_accounting/backend/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/goodsign/monday"
	"github.com/google/uuid"
)

type FileHandlers struct {
	service services.File
}

func NewFileHandlers(service services.File) *FileHandlers {
	return &FileHandlers{
		service: service,
	}
}

func Register(api *gin.RouterGroup, service services.File, middleware *middleware.Middleware) {
	handlers := NewFileHandlers(service)

	files := api.Group("/files")
	{
		files.GET("", middleware.CheckPermissions(constants.SI, constants.Read), handlers.export)
		files.GET("/schedule", middleware.CheckPermissions(constants.SI, constants.Write), handlers.makeVerificationSchedule)
	}
}

func (h *FileHandlers) export(c *gin.Context) {
	realm := c.GetHeader("realm")
	err := uuid.Validate(realm)
	if err != nil {
		response.NewErrorResponse(c, http.StatusBadRequest, "empty param", "Сессия не найдена")
		return
	}

	params := &models.SIParams{
		RealmId: realm,
		Page: &models.SIPage{
			Limit: 999999,
		},
		Sort:    []*models.SISort{},
		Filters: []*models.SIFilter{},
	}

	sortLine := c.Query("sort_by")
	filters := c.QueryMap("filters")
	all := c.Query("all")

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

	for k, v := range filters {
		valueMap := c.QueryMap(k)

		values := []*models.SIFilterValue{}
		for key, value := range valueMap {
			if k == "place" {
				statusFilter := &models.SIFilter{Field: "status", FieldType: "list", Values: []*models.SIFilterValue{{CompareType: "in"}}}
				tmp := []string{}
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

		f := &models.SIFilter{
			Field:     k,
			FieldType: v,
			Values:    values,
		}

		params.Filters = append(params.Filters, f)
	}

	if all != "true" {
		params.Filters = append(params.Filters, &models.SIFilter{
			Field:     "status",
			FieldType: "",
			Values:    []*models.SIFilterValue{{CompareType: "nlike", Value: "reserve"}},
		})
		//TODO задавать id подразделения не очень хорошая идея
		params.Filters = append(params.Filters, &models.SIFilter{
			Field:     "department",
			FieldType: "list",
			Values:    []*models.SIFilterValue{{CompareType: "nin", Value: "cc718041-f3da-4490-b647-380297bd3344"}},
		})
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

	buffer, err := h.service.Export(c, params)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), params)
		return
	}

	// extraHeaders := map[string]string{
	// 	"Content-Disposition": fmt.Sprintf(`attachment; filename="Инструменты от %s"`, monday.Format(time.Now(), "Mon 2 Jan 2006", monday.LocaleRuRU)),
	// }
	// c.DataFromReader(http.StatusOK, int64(buffer.Cap()), "application/vnd.openxmlformats-package.relationships+xml", buffer, extraHeaders)

	c.Header("Content-Disposition", "attachment; filename=Список инструментов от "+monday.Format(time.Now(), "Mon 2 Jan 2006", monday.LocaleRuRU)+".xlsx")
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Type", "application/vnd.openxmlformats-package.relationships+xml")
	c.Header("Accept-Length", fmt.Sprintf("%d", buffer.Cap()))
	c.Writer.Write(buffer.Bytes())
	// c.JSON(http.StatusOK, response.IdResponse{Message: "Download file successfully"})
}

func (h *FileHandlers) makeVerificationSchedule(c *gin.Context) {
	params := &models.SIParams{
		Page: &models.SIPage{
			Limit: 999999,
		},
		Status: constants.InstrumentStatusWork,
		Sort: []*models.SISort{{
			Field: "nextVerificationDate", Type: "ASC",
		}},
		Filters: []*models.SIFilter{{
			Field:  "nextVerificationDate",
			Values: []*models.SIFilterValue{},
		}},
	}

	period := c.QueryMap("period")
	for k, v := range period {
		params.Filters[len(params.Filters)-1].Values = append(params.Filters[len(params.Filters)-1].Values, &models.SIFilterValue{
			CompareType: k,
			Value:       v,
		})
	}

	logger.Debug("filter", logger.AnyAttr("values", params.Filters[len(params.Filters)-1]))

	buffer, err := h.service.MakeVerificationSchedule(c, params)
	if err != nil {
		response.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), "Произошла ошибка: "+err.Error())
		error_bot.Send(c, err.Error(), params)
		return
	}

	c.Header("Content-Disposition", "attachment; filename=График поверки от "+monday.Format(time.Now(), "Mon 2 Jan 2006", monday.LocaleRuRU)+".xlsx")
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Type", "application/vnd.openxmlformats-package.relationships+xml")
	c.Header("Accept-Length", fmt.Sprintf("%d", buffer.Cap()))
	c.Writer.Write(buffer.Bytes())
	// c.JSON(http.StatusOK, response.IdResponse{Message: "Download file successfully"})
}
