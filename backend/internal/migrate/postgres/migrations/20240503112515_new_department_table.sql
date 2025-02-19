-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.departments
(
    id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    leader_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT departments_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.departments
    OWNER to postgres;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.departments;
-- +goose StatementEnd
