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

# copy contents into docs folder
cp -R src/. docs/ &
BACK_PID=$!

wait $BACK_PID

if [[ $ENV == "PROD" ]]; then
	sed -i -e 's/\#\[VUE\_URL\]/https:\/\/cdn\.jsdelivr\.net\/npm\/vue/g' docs/index.html
	sed -i -e 's/\#\[REDIRECT\_URL\]/https\:\/\/polltery\.github\.io\/spotify\-playlist\-joiner\-app\//g' docs/config.js
else
	sed -i -e 's/\#\[VUE\_URL\]/https:\/\/cdn.jsdelivr.net\/npm\/vue\/dist\/vue.js/g' docs/index.html
	sed -i -e 's/\#\[REDIRECT\_URL\]/http\:\/\/localhost\:3000\//g' docs/config.js
fi

rm -f docs/config.js-e
rm -f docs/index.html-e

echo build:complete