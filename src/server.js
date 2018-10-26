const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const https = require('https');
const url = "https://api.mysportsfeeds.com/v2.0/pull/nfl"
const request = require('request');
const rp = require('request-promise');
const moment = require('moment-holiday')
const morgan = require('morgan');
const apiKey = process.env.API_KEY;
const password = process.env.PASSWORD;

let apiObj = {};

app.set("view engine", "ejs");

//********************************************

const queryUrlBuilder = url => {
  const currentNFLYear = moment().get('year')
  const dayOfWeek = moment().day()

  const seasonType = () => {
    return (moment().get('year') === 2018) ? "regular"
      : ("playoff")
  }

  const weekNumberBuilder = () => {
    return (currentNFLYear === 2018 && dayOfWeek > 3) ? (moment().get('week') - 35)
      : (currentNFLYear === 2018 && dayOfWeek <= 3) ? (moment().get('week') - 36)
      : (currentNFLYear === 2019 && dayOfWeek > 3) ? (moment().get('week') + 1)
      : (moment().get('week'));
  }

  let weekObj = {
    currentNFLYear: moment().get('year'),
    seasonType: seasonType(),
    currentNFLWeek: weekNumberBuilder(),
  }
  return (url + `/${weekObj.currentNFLYear}-${weekObj.seasonType}/week/${weekObj.currentNFLWeek}/games.json`)
}

//********************************************

const asciiMapper = ({ games }) => {
  games.forEach(gameHandler)
};

const gameHandler = game => {
  console.log(`+---------------+`)
  console.log((game.schedule.awayTeam.abbreviation.length === 2 ? game.schedule.awayTeam.abbreviation + "   " : game.schedule.awayTeam.abbreviation + "  ")
  + (game.score.awayScoreTotal === null ? "0" : game.score.awayScoreTotal))
  console.log((game.schedule.homeTeam.abbreviation.length === 2 ? game.schedule.homeTeam.abbreviation + "   " : game.schedule.homeTeam.abbreviation + "  ")
  + (game.score.homeScoreTotal === null ? "0" : game.score.homeScoreTotal))
}

let query = rp.get(queryUrlBuilder(url), {
  "auth": {
    'user': apiKey,
    'pass': password,
    'sendImmediately': true,
  }
})

const mySportsFeedsApiCall = async (query) =>{
  try {
    let result = await rp(query)
    asciiMapper(JSON.parse(result));
    return result
  }
  catch (e){
    return console.error("*** ERROR ***",e)
  }
}

mySportsFeedsApiCall(query)

//********************************************

app.use(morgan('combined'))

app.get("/", (req, res) => {
	res.send();
	}
)

console.log(`Server is listening on localhost:${PORT}`);
app.listen(PORT)
