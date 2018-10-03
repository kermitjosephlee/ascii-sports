const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.API_KEY_V2;
const password = process.env.PASSWORD;
const https = require('https');
const request = require('request');
const rp = require('request-promise');
const morgan = require('morgan');

const url = "https://api.mysportsfeeds.com/v2.0/pull/nfl/2018-regular/week/4/games.json"

//********************************************

const weekFinder = () => {
	const currentTime = new Date;
	let currentMonth = currentTime.getMonth() + 1;
	let currentDate = currentTime.getDate();

}



//********************************************

const mySportsFeedsApiCall = async (query) => {
	try {
		let result = await rp(query)
	}
	catch (error){
		return console.err(error)
	}
}



//********************************************


app.use(morgan('combined'))

app.get("/", (req, res) => {
	let currentTime = new Date;
	res.send(currentTime);
	}
)
console.log(`Server is listening on localhost:${PORT}`);
app.listen(PORT)
