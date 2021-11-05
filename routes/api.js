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

function setupRouter(appglobals) {
  var express = require('express');
  var router = express.Router();
  
  router.get('/timetoid/', function(req, res, next) {
    res.redirect('0');    
  });

  router.get('/timetoid/:dupes/', function(req, res, next) {
    ids = timetoid(Date.now().valueOf(), Number(req.params.dupes))
    res.json(ids.output);    
  });

  router.get('/allpages/', function(req, res, next) {
    appglobals.db_pool.getConnection()
    .then(conn => {
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
    res.json(req.body);
  });

  router.post('/addpage/', function(req, res, next) {
    appglobals.db_pool.getConnection()
    .then(conn => {
      timeint = Date.now().valueOf();
      conn.query("SELECT COUNT(1) AS dupes FROM pages WHERE time=?;", timeint)
      .then((rows) => {
        res.json(rows);
        ids = timetoid(Date.now().valueOf(), Number(rows[0].dupes))
        return conn.query("INSERT INTO pages VALUE (?, ?, ?, ?, ?)", [
          ids.output.string,
          timeint,
          req.body.title,
          req.body.lead,
          req.body.body
        ]);
      }).then((res) => {
        console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
        conn.end();
      }).catch(err => { // queries error
        //handle error
        console.log(err); 
        conn.end();
      })
    }).catch(err => { // connection error
      console.log("Not connected.");
      res.send("Not connected.")
    });
  });

  return router;
}

module.exports = setupRouter;
