# ASCII-SPORTS

## A simple lightweight cURL-friendly sports score app

## Screenshot

![screenshot-cli](./images/screenShot-cli.png?raw=true 'Screenshot CLIs')

### Installation

- fork or clone the repo
- install dependencies using **npm install**
- create an ./.env file with your API key from MySportsFeeds.com
- start the server using **npm start**

### Use

#### Local Deployment

- in another terminal, use **curl localhost:3000** to get your cli scores
- open your favorite browser - **localhost:3000**

#### Heroku - **_www.asciisports.com_**

Available Endpoints:

- **/** - root - shows NFL scores by default
- **/nfl** - NFL scores
- **/nba** - NBA scores

#### Example

> \$curl www.asciisports.com/nba

---

- inspired by [@igor_chubin](https://github.com/chubin) of wttr.in
- Special thanks to [Brad Barkhouse](https://github.com/bradbarkhouse) at MySportsFeeds.com
