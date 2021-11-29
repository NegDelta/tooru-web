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

function prom_dbConnection (httpres, conn_prom) {
  // conn_prom must take connection and resolve returning connection
  var prom_report_success = (conn) => {
    console.log("Connected to database, connection id is " + conn.threadId);
    return conn
  };
  
  var handle_connection = (conn) =>
    conn_prom(conn)
    .then(() => {
      console.log("Ending connection " + conn.threadId);
      conn.end();
    })
    .catch(err => {
      console.log(err); 
      conn.end();
    });

  return mdb_pool.getConnection()
  .then(prom_report_success)
  .then(handle_connection)
  .catch(err => {
    httpres.send("Cannot connect to database") // TODO: render
  });
}

const appglobals = {
  mdb_pool: mdb_pool,
  cfg: cfg,

  timetoid: timetoid,
  
  time_fmt: timestr => new Date(Number(timestr)).toISOString(),
  
  prom_updatePage: function (httpres, timeint, reqparams, pageid, dbres_cb) {
    return prom_dbConnection(httpres, dbconn => 
      dbconn.query(
        "UPDATE pages SET edit_time=?, title=?, lead=?, body=? WHERE id=?", [
        timeint,
        reqparams.title,
        reqparams.lead,
        reqparams.body,
        pageid
      ]).then(dbres_cb)
    );
  },

  prom_postPage: function (httpres, timeint, reqparams, dbres_cb) {
    return prom_dbConnection(httpres, dbconn => 
      dbconn.query("SELECT COUNT(1) AS dupes FROM pages WHERE time=?;", timeint)
      .then((dbres) => {
        ids = timetoid(timeint, Number(dbres[0].dupes));
        return dbconn.query(
          "INSERT INTO pages VALUES (?, ?, ?, ?, ?, ?) RETURNING id", [
          ids.output.string,
          timeint,
          timeint,
          reqparams.title,
          reqparams.lead,
          reqparams.body
        ]);
      })
      .then(dbres_cb)
    );
  },

  prom_deletePage: function (httpres, pageid, dbres_cb) {
    return prom_dbConnection(httpres, dbconn => 
      dbconn.query("DELETE FROM pages WHERE id=?;", pageid)
      .then(dbres_cb)
    );
  },

  prom_getPage: function (httpres, pageid, dbres_cb) {
    return prom_dbConnection(httpres, dbconn => 
      dbconn.query("SELECT * FROM pages WHERE id=?;", pageid)
      .then(dbres_cb)
    );
  },

  prom_getAllPages: function (httpres, dbres_cb) {
    return prom_dbConnection(httpres, dbconn => 
      dbconn.query("SELECT * FROM pages ORDER BY time DESC;")
      .then(dbres_cb)
    );
  },

  main_menu_entries: [
    { text: 'all pages', path: '.'},
    { text: 'new page', path: 'pages/new/'},
    { text: 'admin', path: 'admin/'},
  ]
}
module.exports = appglobals
