-include .env

.PHONY: init build clear list example

init:; npm i

build :; rm -rf dist; npx tsc

clear :; rm -rf dist

list :; node dist/cli/list.js

example :; node dist/cli/example.cli.js

dev :; npx nodemon src/cli/$(cmd).ts

-include ${FCT_PLUGIN_PATH}/makefile-external