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
  
  router.get('/timetoid/', function(req, res, next) {
    res.redirect('0');    
  });

  router.get('/timetoid/:dupes/', function(req, res, next) {
    ids = timetoid(Date.now().valueOf(), Number(req.params.dupes))
    res.json(ids);    
  });

  router.get('/allpages/', function(req, res, next) {
    mdb_pool.getConnection()
    .then(conn => {
      conn.query("SELECT 1 as val")
        .then((rows) => {
          /*console.log(rows); //[ {val: 1}, meta: ... ]
          //Table must have been created before 
          // " CREATE TABLE myTable (id int, val varchar(255)) "
          return conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
        })
        .then((pr_res) => {*/
          res.json(rows); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
          conn.end();
        })
        .catch(err => {
          //handle error
          console.log(err); 
          conn.end();
        })
    }).catch(err => {
      //not connected
      res.send("Not connected.")
    });
    
  });

  return router;
}

module.exports = setupRouter;
