var sql = require('seriate');
var config = {
	"server": "sqldbteam4kevin.database.windows.net",
	"user": "team4admin",
	"password": "admin4-team4",
	"database": "csc155-4db",
    "options": {
        encrypt: true
    }
};

exports.findById = function(id, cb) {
  sql.execute({
       query: "SELECT id, username, password, displayname FROM [csc155-4db].[dbo].[Users]"
  }).then( function( results ) {
        process.nextTick(function() {
            var idx = id - 1;
            if (results[idx]) {
            cb(null, results[idx]);
            } else {
            cb(new Error('User ' + id + ' does not exist'));
            }
        });
  });
};

exports.findByUsername = function(username, cb) {
  sql.execute({
        query: "SELECT id, username, password, displayname FROM [csc155-4db].[dbo].[Users]"
  }).then( function( results ) {
        process.nextTick(function() {
            for (var i = 0, len = results.length; i < len; i++) {
            var record = results[i];
            if (record.username === username) {
                return cb(null, record);
            }
            }
            return cb(null, null);
        });
    });
};


/*
var records = [
    { id: 1, username: 'jack', password: 'secret', displayName: 'Jack', emails: [ { value: 'jack@example.com' } ] }
  , { id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', emails: [ { value: 'jill@example.com' } ] }
];


exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}
*/