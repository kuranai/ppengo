var express = require('express');
var router = express.Router();
var Diff = require('diff');

const Webpage = require('./models/webpage');
const Request = require('./models/request');
const Response = require('./models/response');
const Website = require('./models/website');

router.get('/',  function(req, res) {
  Webpage.find()
      .sort("-createdAt")
      .limit(100)
      .then((webpages) => {
        res.render(
          'pages', {
            title: "Page",
            webpages,
          });
      })
      .catch((err) => { 
        console.log(err);
        res.send(err); 
      });
});

router.get('/:id', async function(req, res, next) {
  const id = req.params.id;  
  var webpage = await Webpage.findById(id)
    .then((document) => {
      return document;
  });
  
  var diff;
  if (webpage.content){
    var previous = await Webpage.find({
      "input":webpage.input,
      "createdAt":{$lt: webpage.createdAt}
    }).sort("-createdAt")
    .then((document) => {
      console.log(document.length);
      return document;
    });
    if (previous.length){
      previous = previous[0];
      if (previous.content && webpage.content){
        diff =  Diff.createPatch("", previous.content, webpage.content, previous._id, webpage._id) 
      }
    }
  }
  //console.log(diff);
  
  var requests = await Request.find({"webpage":id})
    .sort("createdAt")
    .then((document) => {
      return document;
  });
  var search = [];
  if(typeof req.query.rurl !== 'undefined' && req.query.rurl){
    //search.push({"url":new RegExp(RegExp.escape(req.query.rurl))});
    search.push({"url":new RegExp(req.query.rurl)});

  }
  if(typeof req.query.source !== 'undefined' && req.query.source){
    //search.push({"text": new RegExp(RegExp.escape(req.query.source))});
    search.push({"text": new RegExp(req.query.source)});
  }
  if(typeof req.query.status !== 'undefined' && req.query.status){
    search.push({"$where": `/${req.query.status}/.test(this.status)`});
  }
  console.log(req.query, search);
  var responses;
  if(search.length){
    const find = await Response.find({"webpage":id}).and(search).sort("-createdAt")
    .then((document)=>{return document});
    responses = find;
  } else{
    const find = await Response.find({"webpage":id}).sort("-createdAt")
    .then((document)=>{return document});
    responses = find;
  } 
  /*
  var responses = await Response.find({"webpage":id})
    .sort("createdAt").then((document) => {
      return document;
  });
  */
  var website = await Website.findOne({"url":webpage.input})
  .then((document) => {
    return document;
  });
  console.log(webpage.yara)  
  res.render('page', { 
        webpage,
        requests,
        responses,
        website,
        previous:previous,
        diff,
        search:req.query
  });
});

module.exports = router;
