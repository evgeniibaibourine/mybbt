// web.js
var gzippo = require('gzippo');
var express = require("express");
var logfmt = require("logfmt");
var moment = require("moment");
var bodyParser = require("body-parser");
var Promise = require('bluebird');
var mongodb = require("mongodb");
moment().format();

var app = express();
app.use(logfmt.requestLogger());
app.use(bodyParser.json());
app.use(gzippo.staticGzip("" + __dirname + "/app"));

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test", function(err, client) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = client.db();
    console.log("Database connection ready");

    // Initialize the app.
    var server = app.listen(process.env.PORT || 8080, function() {
        var port = server.address().port;
        console.log("App now running on port", port);
    });
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({ "error": message });
}


//ACTUAL SERVER.JS CODE ==== THESE ARE THE REAL ROUTES FOR THE APP
function getSum(array, field = "Remittance") {
    return array.map((record) => {
        var val = record[field];
        if (typeof val === "string") {
            //get rid of commas if they exist
            val = parseFloat(val.replace(/,/g, ''));
        }
        return val;
    }).reduce((a, b) => {
        return a + b;
    }, 0);
}

function getMax(array, field = "Remittance") {
    valArray = array.map((record) => {
        var val = record[field];
        if (typeof val === "string") {
            //get rid of commas if they exist
            val = parseFloat(val.replace(/,/g, ''));
        }
        return val;
    });
    return Math.max(...valArray);
}

function getDataFromDb(search /*MongoDB search obj*/ , strict /*fail if 0 results*/ ) {
    return new Promise((resolve, reject) => {
        return db.collection(REMITTANCE_COLLECTION).find(search).toArray((err, doc) => {
            if (err) {
                console.log("Error getting data from db", err);
                reject(err.message);
            } else {
                if (strict && doc.length == 0) {
                    reject('Did not find any entries matching the search criteria');
                } else {
                    resolve(doc);
                }
            }
        });
    });
}

// set up our one route to the index.html file
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/app/index.html')
});

var REMITTANCE_COLLECTION = "remittance";
//10% improvement year over year
const IMPROVEMENT = 1.10;

app.get("/api/remittances", function(req, res) {
    db.collection(REMITTANCE_COLLECTION).find({}).toArray(function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get the remittance collection.");
        } else {
            return res.status(200).json({
                data: doc,
                sum: getSum(doc),
                max: getMax(doc)
            });
        }
    });
});

app.get("/api/dashboard", function(req, res) {
    let now = moment();
    let monthNumber = moment().month();
    let thisMonth = moment().month(monthNumber).format('MMMM');
    let thisYear = 2017; // now.year();  // <-- use this because we don't have 2018 data yet
    let lastYear = moment().subtract(1, 'year');
    let ret = {};
    let uniqueTemples;

    return new Promise((resolve, reject) => {
        //First, get the unique temples throughout all history
        return getDataFromDb({}).then((results) => {
            uniqueTemples = results.map((record) => {
                return record.Temple;
            });
            uniqueTemples = [...new Set(uniqueTemples)];
        }).then(() => {
            return Promise.map(uniqueTemples, (temple) => {
                return getDataFromDb({ 'Year': lastYear.year(), 'Temple': temple }).then((result) => {
                    //We have all the records for the previous year for a particular temple
                    //Calculate the current year goal from the prewvious year sum
                    console.log("=======================================");
                    console.log("Getting data for " + lastYear.year() + " for " + temple);
                    console.log(JSON.stringify(result));
                    console.log("The goal will be " + (getSum(result) * IMPROVEMENT).toFixed(0));
                    console.log("=======================================\n")
                    ret[temple] = ret[temple] || {};
                    ret[temple]['goal'] = (getSum(result) * IMPROVEMENT).toFixed(0);
                });
            });
        }).then(() => {
            //get the current year to date
            return Promise.map(uniqueTemples, (temple) => {
                return getDataFromDb({ 'Year': thisYear, 'Temple': temple }).then((result) => {
                    //We have all the records for the previous year for a particular temple
                    //Calculate the current YTD sum
                    ret[temple]['ytd'] = getSum(result);
                });
            });
        }).then(() => {
            return Promise.map(uniqueTemples, (temple) => {
                return getDataFromDb({ 'Year': thisYear, 'Temple': temple, 'Month': thisMonth }).then((result) => {
                    //current month calcs
                    ret[temple]['currentMonth'] = result;
                });
            });
        }).then(() => {
            return res.status(200).json(ret);
        });
    });
});

app.get("/api/remittances/temple/:temple", function(req, res) {
    db.collection(REMITTANCE_COLLECTION).find({ "Temple": req.params.temple }).toArray(function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get temple");
        } else {
            return res.status(200).json({
                data: doc,
                sum: getSum(doc),
                max: getMax(doc)
            });
        }
    });
});

app.get("/api/remittances/year/:year/:temple", function(req, res) {
    db.collection(REMITTANCE_COLLECTION)
        .find({ "Temple": req.params.temple, "Year": parseInt(req.params.year) })
        .toArray(function(err, doc) {
            if (err) {
                handleError(res, err.message, "Failed to get yearly data for temple");
            } else {
                return res.status(200).json({
                    data: doc,
                    sum: getSum(doc),
                    max: getMax(doc)
                });
            }
        });
});

app.get("/api/remittances/year/:year", function(req, res) {
    db.collection(REMITTANCE_COLLECTION)
        .find({ "Year": parseInt(req.params.year) })
        .toArray(function(err, doc) {
            if (err) {
                handleError(res, err.message, "Failed to get yearly data");
            } else {
                return res.status(200).json({
                    data: doc,
                    sum: getSum(doc),
                    max: getMax(doc)
                });
            }
        });
});

app.get("/api/remittances/gbc/:gbc", function(req, res) {
    db.collection(REMITTANCE_COLLECTION).find({ "GBC": req.params.gbc }).toArray(function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get GBC");
        } else {
            return res.status(200).json({
                data: doc,
                sum: getSum(doc),
                max: getMax(doc)
            });
        }
    });
});

app.get("/api/remittances/:year/:month", function(req, res) {
    db.collection(REMITTANCE_COLLECTION).find({ "Year": parseInt(req.params.year), "Month": req.params.month }).toArray(function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get monthly data");
        } else {
            return res.status(200).json({
                data: doc,
                sum: getSum(doc),
                max: getMax(doc)
            });
        }
    });
});

app.get("/api/remittances/:year/:month/:temple", function(req, res) {
    db.collection(REMITTANCE_COLLECTION)
        .find({ "Temple": req.params.temple, "Month": req.params.month, "Year": parseInt(req.params.year) })
        .toArray(function(err, doc) {
            if (err) {
                handleError(res, err.message, "Failed to get monthly data");
            } else {
                return res.status(200).json({
                    data: doc,
                    sum: getSum(doc),
                    max: getMax(doc)
                });
            }
        });
});


app.get("/api/remittances/history", function(req, res) {
    if (!req.query.months || isNaN(req.query.months)) {
        handleError(res, "No month lookback supplied or not a number", "Failed to get historical data");
    }

    let startDate = moment().startOf('month').subtract(req.query.months, 'months');
    let filteredByDate;
    let final;
    let ret = {};

    //Simplify to call the API only once, then filter here on the server
    db.collection(REMITTANCE_COLLECTION).find({}).toArray(function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get all the data from the db");
        } else {
            filteredByDate = doc.filter(record => {
                let recordDate = moment().year(record.Year).month(record.Month);
                return recordDate.isAfter(startDate);
            });
        }
        if (req.query.location && req.query.location !== "") {
            final = filteredByDate.filter(record => {
                return record.Temple === req.query.location;
            });
            ret.data = final;
        } else {
            ret.data = filteredByDate;
        }

        let total = ret.data.map(record => {
            return record.Remittance;
        }).reduce((a, b) => {
            return a + b;
        }, 0)

        ret.sum = total;
        res.status(200).json(ret);
    });
});


app.get("/api", function(req, res) {
    let ret = [];
    app._router.stack.forEach(function(r) {
        if (r.route && r.route.path) {
            ret.push(r.route.path);
        }
    });
    res.status(200).json(ret);
});