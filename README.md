## Getting Started:
#### 1. Install node and npm:
   <http://lmgtfy.com/?q=install+nodejs+npm>

#### 2. Clone the repository:  
```
https://github.com/akkapur/review.git
cd review
```
#### 3. Run the dev setup script
```
npm install -g grunt-cli
npm install -g bower
bower update
bower install
npm install
npm update
node_modules/protractor/bin/webdriver-manager update --chrome --standalone

or, if on mac or *nix

npm run setup

```
#### 4. Run the dev build sequence, and kick off tests:
```
grunt quick-build
```
## Running the project locally:
```
npm start
```

