require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const cors = require('cors');
const app = express();
const Url = require('./models/url');

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

app.post('/api/shorturl', (req, res) => {

  // per project requirements, only allow URLs with protocol intact
  const protocolRegex = /^https?:\/\//ig;
  const isValidUrl = protocolRegex.test(req.body.url);

  // strip protocol from posted URL for validation
  const hostname = req.body.url.replace(protocolRegex, '')

  // URL validation
  dns.lookup(hostname, (err, data) => {
    if (err || !isValidUrl){
      console.log(err);
      console.log(isValidUrl)
      res.status(400).json({ error: 'invalid url' })
    } else {
      res.json({ original_url: req.body.url })
    }
  })
})


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
