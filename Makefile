all: test

test: v0.8 v0.12 v4. v6. v7.

v%:
	#rm -rf node_modules
	n $@
	#npm install
	npm test

gitChanges:
	@git diff-files --quiet # fail if unstaged changes
	@git diff-index --quiet HEAD # fail if uncommited changes

gh-pages: src gitChanges
	git branch -f gh-pages
	git checkout gh-pages
	git reset --hard master
	npm run doc
	cp -r docs/* .
	git add .
	git commit -a -m 'gh-pages update'
	git checkout master

push: gitChanges
	git push origin master
	git push origin gh-pages

publish: src gitChanges
	npm run dist
	npm publish

.PHONY: all test gitChanges push publish
