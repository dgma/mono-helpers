-include .env

.PHONY: init build clear lint typecheck test pre-commit pre-push dev list wallet tx

all: init clean typecheck test

init:; npm i

typecheck :; npx tsc --project tsconfig.json

clean :; rm -rf dist

lint :; npx eslint src/**/*.ts

lint-stg :; npx lint-staged

test :; npx jest --passWithNoTests

pre-commit: typecheck lint-stg
pre-push : lint typecheck test

migrate :; npx tsx src/migrations/$(script).ts

up :; read -s -r -e -p "MASTER_KEY: " MASTER_KEY && MASTER_KEY=${MASTER_KEY} docker compose up -d && unset MASTER_KEY && docker compose logs -f

# cli
list :; npx tsx src/cli/list.ts

funding :; npx tsx src/cli/funding.ts

fuel :; npx tsx src/cli/fuel.ts

report :; npx tsx src/cli/report.ts

profiles :; npx tsx src/cli/profiles.ts

recover :; npx tsx src/cli/profiles.ts

encryptJson :; npx tsx src/cli/encryptJson.ts

-include ${FCT_PLUGIN_PATH}/makefile-external