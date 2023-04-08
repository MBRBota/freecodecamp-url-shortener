require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const cors = require('cors');
const app = express();
const Url = require('./models/url');

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Cross-origin resource sharing middleware for freeCodeCamp remote testing
app.use(cors());

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

app.post('/api/shorturl', (req, res) => {

  // remove trailing slash (if existent) from URL for lookup
  const cleanedUrl = req.body.url.replace(/\/$/, '');

  // check if URL has already been shortened
  Url.findOne({ original_url: cleanedUrl })
    .then((foundUrl) => {
    if(foundUrl){
      res.json({ original_url: foundUrl.original_url, short_url: foundUrl.short_url });
    } else {

      // per project requirements, only allow URLs with protocol intact
      const protocolRegex = /^https?:\/\//i;
      const isValidUrl = protocolRegex.test(cleanedUrl);
    
      // strip protocol and path from posted URL for validation
      const hostnameRegex = /^https?:\/\/|\/.*/gi
      const hostname = cleanedUrl.replace(hostnameRegex, '');
    
      // URL validation
      dns.lookup(hostname, (err) => {
        if (err || !isValidUrl){
          res.json({ error: 'invalid url' })
        } else {
          const url = new Url({ original_url: cleanedUrl })

          url.save()
            .then((savedUrl) => {
              res.json({ original_url: savedUrl.original_url, short_url: savedUrl.short_url })
            })
            .catch((err) => {
              console.log(err);
              res.status(400).send("Something went wrong.");
            })
        }
      })
    }
  })
    .catch((err) => {
      console.log(err);
      res.status(400).send("Something went wrong.");
    })
})

app.get('/api/shorturl/:id', (req, res) => {
  Url.findOne({ short_url: req.params.id })
    .then((foundUrl) => {
      if(!foundUrl){
        return res.status(404).send("URL not found.");
      }
      res.redirect(foundUrl.original_url);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send("Something went wrong.")
    })
})


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
