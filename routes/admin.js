function timetoid(timeint, dupecount) {
  timestr_nosuffix = timeint.toString();
  timestr_dupes = timestr_nosuffix + dupecount.toString();
  timestr_dupes_exploded = timestr_dupes.toString().split('')

  // compute hash digit
  const combinationmap = [1,3,7,9];
  hashdig = 0
  timestr_dupes_exploded.forEach((inum, iindex) => {
    hashdig += Number(inum) * combinationmap[iindex % 4];
  });
  hashdig %= 10;

  idint = timeint * 10 + hashdig
  timestr_hash = idint.toString()
  triplets = []
  len = timestr_hash.length;
  triplets.push(timestr_hash.slice(-3));
  triplets.push(timestr_hash.slice(-6, -3));
  triplets.push(timestr_hash.slice(-9, -6));
  triplets.push(timestr_hash.slice(undefined, -9));
/*
  for (beginindex = len-2; beginindex > 0 && beginindex; beginindex-=3) {
    beginindex = i<3 ? undefined : i-3;
    triplets.push(timestr_hash.slice(beginindex, i));
  }*/
  idstring=triplets.join('-');

  return({
    input: {
      time: timeint,
      dupecount: dupecount,
    },
    intermediate: {
      checksum: hashdig
    },
    output: {
      int: idint,
      array: triplets,
      string: idstring
    }
  });
}

function setupRouter(mdb_pool) {
  var express = require('express');
  var router = express.Router();
  
  router.get('/', function(req, res, next) {
    cfg = require('../config.js');
    res.json(cfg);
  });

  router.get('/timetoid/', function(req, res, next) {
    res.redirect('0');    
  });

  router.get('/timetoid/:dupes/', function(req, res, next) {
    ids = timetoid(Date.now().valueOf(), Number(req.params.dupes))
    res.json(ids.output);    
  });

  router.get('/allpages/', function(req, res, next) {
    mdb_pool.getConnection()
    .then(conn => {
      timeint = Date.now().valueOf();
      conn.query("SELECT * FROM pages;")
        .then((rows) => {
          res.json(rows);
          conn.end();
        })
        .catch(err => {
          //handle error
          console.log(err); 
          conn.end();
        })
    }).catch(err => {
      //not connected
      console.log("Not connected.");
      res.send("Not connected.")
    });
  });

  router.post('/dummy/', function(req, res, next) {
    res.json(req);
  });

  return router;
}

module.exports = setupRouter;
