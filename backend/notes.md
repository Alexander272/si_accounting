goose -dir internal/migrate/postgres/migrations postgres "postgresql://postgres:postgres@127.0.0.1:5436/si_accounting?sslmode=disable" down
goose -dir internal/migrate/postgres/migrations create new_table sql
scp -r ./dist administrator@route:/home/administrator/apps/sia
npx vite-bundle-visualizer

export DOCKER_API_VERSION=1.44
unset DOCKER_API_VERSION
