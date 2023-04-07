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

app.use(cors());


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

app.post('/api/shorturl', (req, res) => {

  // remove root path from URL for storage, lookup and validation
  const pathlessUrl = req.body.url.replace(/\/$/, '');

  // check if URL has already been shortened
  Url.findOne({ original_url: pathlessUrl })
    .then((foundUrl) => {

    if(foundUrl){
      res.json({ original_url: foundUrl.original_url, short_url: foundUrl.short_url });
    } else {

      // per project requirements, only allow URLs with protocol intact
      const protocolRegex = /^https?:\/\//i;
      const isValidUrl = protocolRegex.test(pathlessUrl);
    
      // strip protocol from posted URL for validation
      const hostname = pathlessUrl.replace(protocolRegex, '');
    
      // URL validation
      dns.lookup(hostname, (err) => {
        if (err || !isValidUrl){
          console.log(err);
          res.status(400).json({ error: 'invalid url' })
        } else {
          const url = new Url({ original_url: pathlessUrl })

          url.save()
            .then((savedUrl) => {
              res.json({ original_url: savedUrl.original_url, short_url: savedUrl.short_url })
            })
            .catch((err) => {
              console.log(err);
            })
        }
      })
    }
  })
    .catch((err) => {
      console.log(err);
    })
})


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
