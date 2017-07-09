all: clean build

test: v0.8 v0.12 v4. v6. v8.

v%:
	n $@
	npm test

gitChanges:
	@git diff-files --quiet # fail if unstaged changes
	@git diff-index --quiet HEAD # fail if uncommited changes

gh-pages: src gitChanges
	git branch -f gh-pages
	git checkout gh-pages
	git reset --hard master
	npm run clean
	npm run doc
	cp -r docs/* .
	rm -rf docs/*
	git add .
	git commit -a -m 'gh-pages update'
	git checkout master

push: gitChanges
	git push origin master
	git push origin gh-pages -f

docs: src scripts
	npm run doc

dist: src dist/index.min.js dist/index.js

dist/index.js: src
	npm run lint \
	&& npm run build \
	&& npm run mocha \
	&& npm version

dist/index.min.js: dist/index.js
	`npm bin`/uglifyjs $< -c -m -o $@

build: lib dist

lib:
	npm run transpile

pack: node_modules build
	rm *.tgz
	npm pack
	tar tvzf *.tgz

publish: node_modules build gitChanges
	rm *.tgz
	npm publish

node_modules:
	npm update

clean:
	rm -rf lib dist docs coverage

clean-all: clean
	rm -rf node_modules

.PHONY: all build test gitChanges push publish
