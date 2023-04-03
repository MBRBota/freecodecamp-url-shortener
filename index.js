require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const port = 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(`${process.cwd()}/views/index.html`);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
