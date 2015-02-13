6TO5 = node_modules/.bin/6to5
MOCHA = node_modules/.bin/mocha
_MOCHA = node_modules/.bin/_mocha
ISTANBUL = node_modules/.bin/ISTANBUL
JSCS = node_modules/.bin/jscs
JSHINT = node_modules/.bin/jshint

MOCHA_OPTS = --recursive

export NODE_ENV = test

.PHONY: build clean dist test test-cov lint

build:
	$(6TO5) src/ --modules common --out-dir dist

clean:
	rm -rf dist coverage

dist:
	make clean
	make build

test: lint
	make build
	$(MOCHA) $(MOCHA_OPTS)

test-cov:
	make build
	mkdir -p coverage
	$(ISTANBUL) cover $(_MOCHA) -- $(MOCHA_OPTS)

lint:
	$(JSHINT) .
	$(JSCS) -c .jscsrc .
