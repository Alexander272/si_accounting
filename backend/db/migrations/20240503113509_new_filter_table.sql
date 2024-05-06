-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.default_filters
(
    id uuid NOT NULL,
    sso_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    filter_name text COLLATE pg_catalog."default" NOT NULL,
    compare_type text COLLATE pg_catalog."default" NOT NULL,
    value text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT default_filters_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.default_filters
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.default_filters;
-- +goose StatementEnd
