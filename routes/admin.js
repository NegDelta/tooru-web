var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('adminindex');
});

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

router.get('/timetoid', function(req, res, next) {
  ids = timetoid(Date.now().valueOf(), 0)
  res.json(ids);    
});

module.exports = router;
