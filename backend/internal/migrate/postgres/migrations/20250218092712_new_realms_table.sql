-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS public.realms
(
    id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    realm text COLLATE pg_catalog."default" NOT NULL,
    is_active boolean DEFAULT true,
    reserve_channel text COLLATE pg_catalog."default" DEFAULT ''::text,
    expiration_notice boolean DEFAULT false,
    location_type text COLLATE pg_catalog."default" DEFAULT 'department'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT realms_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.realms
    OWNER to postgres;

INSERT INTO public.realms (id, name, realm, reserve_channel) VALUES
    ('587b5e1d-c46b-48d5-8baf-251ceb6dcba1','Метролог','metrolog','hg8pbthj33rdpcfianbj9wfb8a');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS public.realms;
-- +goose StatementEnd
