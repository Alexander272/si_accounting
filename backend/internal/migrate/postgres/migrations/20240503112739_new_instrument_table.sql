-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.instruments
(
    id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    type text COLLATE pg_catalog."default" DEFAULT ''::text,
    factory_number text COLLATE pg_catalog."default" NOT NULL,
    measurement_limits text COLLATE pg_catalog."default" DEFAULT ''::text,
    accuracy text COLLATE pg_catalog."default" DEFAULT ''::text,
    state_register text COLLATE pg_catalog."default" DEFAULT ''::text,
    manufacturer text COLLATE pg_catalog."default" DEFAULT ''::text,
    year_of_issue text COLLATE pg_catalog."default" DEFAULT ''::text,
    inter_verification_interval text COLLATE pg_catalog."default" NOT NULL,
    notes text COLLATE pg_catalog."default" DEFAULT ''::text,
    status text COLLATE pg_catalog."default" DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT instruments_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.instruments
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.instruments;
-- +goose StatementEnd
