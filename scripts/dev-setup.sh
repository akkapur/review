#! /bin/bash
npm install -g grunt-cli
npm install -g bower
bower update
bower install
npm install
npm update
node_modules/protractor/bin/webdriver-manager update --chrome --standalone
echo -e "Done\n"
