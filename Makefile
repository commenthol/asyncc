all: v4.0 v6.9

v%:
	n $@ && npm test

.PHONY: all
