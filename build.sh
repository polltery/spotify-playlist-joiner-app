#!/bin/bash

ENV=${1:-DEV}

echo build:start 
echo build:mode:$ENV

# remove docs if it exsits
if [ -d "docs" ]; then
	rm -dr docs
fi

# make docs folder
mkdir docs
mkdir temp

# copy contents into temp folder
cp -R src/. temp/ &
BACK_PID=$!
wait $BACK_PID

if [[ $ENV == "PROD" ]]; then
	sed -i -e 's/\#\[VUE\_URL\]/https:\/\/cdn\.jsdelivr\.net\/npm\/vue/g' temp/index.html
	sed -i -e 's/\#\[REDIRECT\_URL\]/https\:\/\/polltery\.github\.io\/spotify\-playlist\-joiner\-app\//g' temp/config.js
	minify temp/config.js > docs/config.js
	minify temp/app.js > docs/app.js
	html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true temp/index.html -o docs/index.html
else
	sed -i -e 's/\#\[VUE\_URL\]/https:\/\/cdn.jsdelivr.net\/npm\/vue\/dist\/vue.js/g' temp/index.html
	sed -i -e 's/\#\[REDIRECT\_URL\]/http\:\/\/localhost\:3000\//g' temp/config.js
	# copy contents into docs folder
	cp -R temp/. docs/ &
	BACK_PID=$!
	wait $BACK_PID
fi

# clean up
rm -f temp/config.js-e
rm -f temp/index.html-e

rm -dr temp

echo build:complete