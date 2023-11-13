require('dotenv').config();
const urlparser= require ('url');
const express = require('express');
const dns = require('node:dns');
const cors = require('cors');
const app = express();
const mongoose  = require('mongoose');
require('dotenv').config();
let bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  url: { type: String, required: true, unique:true },
  shortcut: { type: Number, unique: true }
});

let ShortUrl =  mongoose.model("ShortUrl", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


app.post("/api/shorturl", bodyParser.urlencoded({ extended: false }), shortUrlRes)

function shortUrlRes(req,res){
    dns.lookup(urlparser.parse(req.body.url).hostname, async (err,address)=>{
      if (address){
        const urlExiste = await ShortUrl.findOne({url:req.body.url}, 'url shortcut');
        if(!urlExiste){
          console.log("No existe en la base de datos");
          const conteo = await ShortUrl.countDocuments({});
          console.log(conteo);
          const insertarUrl= { url:req.body.url, shortcut:conteo };
          const result= await ShortUrl.create(insertarUrl);
          console.log(result);
          res.json({
            original_url: req.body.url,
            short_url:conteo
          });
        }else{
          console.log("Si existe");
          res.json({
            original_url: urlExiste.url,
            short_url:urlExiste.shortcut
          });
        };
      }else{
        console.log(err);
        res.json({ error:"invalid url"})
      }
    });
};
app.get("/api/shorturl/:short", shortUrlGet)
async function shortUrlGet (req,res){
  let urlExistente= await ShortUrl.findOne({shortcut: req.params.short}, 'url shortcut');
  res.redirect(urlExistente.url)
};


