var mariadb = require('mariadb');

const cfg = require('./config')
mdb_pool = mariadb.createPool(cfg.dbpool);

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

const appglobals = {
  mdb_pool: mdb_pool,
  cfg: cfg,

  timetoid: timetoid,

  prom_dbConnection: function (httpres, conn_prom) {
    // conn_prom must take connection and resolve returning connection
    var prom_report_success = (conn) => {
      console.log("Connected to database, connection id is " + conn.threadId);
      return conn
    };
    
    return mdb_pool.getConnection()
    .then(prom_report_success)
    .then(conn => {
      conn_prom(conn)
      .then(() => {
        console.log("Ending connection " + conn.threadId);
        conn.end();
      })
      .catch(err => {
        console.log(err); 
        conn.end();
      })
    })
    .catch(err => {
      httpres.send("Cannot connect to database") // TODO: render
    });
  },

  prom_postPage: function (httpres, timeint, reqparams) {
    return (dbconn) => 
      dbconn.query("SELECT COUNT(1) AS dupes FROM pages WHERE time=?;", timeint)
      .then((dbres) => {
        ids = timetoid(timeint, Number(dbres[0].dupes));
        return dbconn.query("INSERT INTO pages VALUE (?, ?, ?, ?, ?)", [
          ids.output.string,
          timeint,
          reqparams.title,
          reqparams.lead,
          reqparams.body
        ]);
      })
      .then((dbres) => {
        console.log(dbres); // affectedRows, insertId, warningStatus
        httpres.redirect('/');
        return dbconn;
      })
  },

  prom_getPage(httpres, pageid) {
    return (dbconn) => 
      dbconn.query("SELECT * FROM pages WHERE id=?;", pageid)
      .then((dbres) => {
        httpres.render('onepage', { page: dbres[0] });
        return dbconn;
      });
  },

  prom_getAllPages: function (httpres) {
    return (dbconn) => 
      dbconn.query("SELECT * FROM pages;")
      .then((dbres) => {
        httpres.render('allpages', { pages: dbres });
        return dbconn;
      });
  }
}
module.exports = appglobals
