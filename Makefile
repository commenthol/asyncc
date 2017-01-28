all: test

test: v0.8 v0.12 v4. v6. v7.

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
	git add .
	git commit -a -m 'gh-pages update'
	git checkout master

push: gitChanges
	git push origin master
	git push origin gh-pages -f

dist: src dist/asyncc.min.js dist/asyncc.js

dist/asyncc.js: src
	npm run lint \
	&& npm run build \
	&& npm run mocha \
	&& npm version

dist/asyncc.min.js: dist/asyncc.js
	uglifyjs $< -c -m -o $@

build: dist

pack: node_modules build dist
	rm *.tgz
	npm pack
	tar tvzf *.tgz

publish: node_modules build dist gitChanges
	rm *.tgz
	npm publish

node_modules:
	npm install

clean:
	rm -rf dist docs coverage

clean-all: clean
	rm -rf node_modules

.PHONY: all test gitChanges push publish
