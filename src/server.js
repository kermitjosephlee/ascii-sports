const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const morgan = require('morgan');

app.use(morgan('combined'))

app.get("/", (req, res) => {
	res.send("Hello World!")
	}
)

console.log(`Server is listening on ${PORT}`);
app.listen(PORT)
