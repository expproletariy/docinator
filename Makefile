.PHONY: up down build restart logs ps shell

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

restart: down up

logs:
	docker-compose logs -f

ps:
	docker-compose ps

shell:
	docker-compose exec backend /bin/sh
