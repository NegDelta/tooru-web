var mariadb = require('mariadb');

const cfg = require('./config')
mdb_pool = mariadb.createPool(cfg.dbpool);

const appglobals = {
    mdb_pool: mdb_pool,
    cfg: cfg,

    timetoid: function (timeint, dupecount) {
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
    },

    prom_get_all_pages: function () {
        return mdb_pool.getConnection()
        .then(
            conn => conn.query("SELECT * FROM pages;")
        ).catch(err => {
            console.log("Not connected.");
        })        
    }
}
module.exports = appglobals
