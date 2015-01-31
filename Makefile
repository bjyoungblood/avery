6TO5 = node_modules/.bin/6to5
MOCHA = node_modules/.bin/mocha
_MOCHA = node_modules/.bin/_mocha
ISTANBUL = node_modules/.bin/ISTANBUL

MOCHA_OPTS = --recursive

export NODE_ENV = test

.PHONY: build clean dist test test-cov lint styler

build:
	$(6TO5) src/ --modules common --out-dir dist

clean:
	rm -rf dist coverage

dist:
	make clean
	make build

test: lint style
	make build
	$(MOCHA) $(MOCHA_OPTS)

test-cov:
	make build
	mkdir -p coverage
	$(ISTANBUL) cover $(_MOCHA) -- $(MOCHA_OPTS)

lint:
	jshint .

style:
	jscs -c .jscsrc .
