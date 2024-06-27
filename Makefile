-include .env

.PHONY: init build clear lint typecheck test pre-commit pre-push dev list example

all: init clean typecheck test

init:; npm i

typecheck :; npx tsc

clean :; rm -rf dist

lint :; npx eslint src/**/*.ts

lint-stg :; npx lint-staged

test :; npx jest --passWithNoTests

pre-commit: typecheck lint-stg
pre-push : lint typecheck test

dev :; npx tsx src/cli/$(cmd).ts

# commands
list :; node --import tsx/esm src/cli/list.ts

wallet :; node --import tsx/esm src/cli/wallet.ts

-include ${FCT_PLUGIN_PATH}/makefile-external