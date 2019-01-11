var express = require('express');
var bodyParser = require('body-parser');
var mongojs = require('./db');


var db = mongojs.connect;
var app = express();
app.use(bodyParser.json());


app.get('/', function (req, res) {
  res.send("Sample Code for RESTful API");
})

// recive Data
app.post('/receiveData', (req, res) => {
  console.log(req.body);
  var devEUI = req.body.DevEUI_uplink.DevEUI;
  var payload_hex = req.body.DevEUI_uplink.payload_hex;
  var timestamp = req.body.DevEUI_uplink.Time;
  decodeCayennePayload(payload_hex,timestamp);
})

// app.get('/getvalue', (req,res) => {
//   var rev = db.temperature.find().limit(1).sort({$natural:-1});
// })

app.get('/showSensorData', function (req, res) {
  db.SensorData.find(function (err, docs) {
    res.send(docs);
  });
})

function decodeCayennePayload(payload_hex,timestamp) {
  var start = 0;
  var end = payload_hex.length;

  do {
    var tempchannel = payload_hex.substring(0, 2);
    var tempdataType = payload_hex.substring(2, 4);
    // var tempdata = payload_hex.substring(4,8);

    var humchannel = payload_hex.substring(8, 10);
    var humdataType = payload_hex.substring(10, 12);
    // var humdata = payload_hex.substring(12,16);

    var personchannel = payload_hex.substring(16, 18);
    // var persondataType = payload_hex.substring(18, 20);
    var persondata = payload_hex.substring(18,20);
// proximity dataType A

    if (tempdataType == "67") {
      var tempvalue = payload_hex.substring(4, 8);
      var tempdec = hexToInt(tempvalue) * 0.1;
      console.log('Temperature Sensor dec : ' + tempdec);

      start = 8;
      if (humdataType == "68") {
        var humvalue = payload_hex.substring(12, 16);
        var humdec = hexToInt(humvalue) * 0.5;
        console.log('Humidity Sensor dec : ' + humdec);

        start = 16;

        if (end > "16") {
          if (personchannel == "02") {
            var pIN = payload_hex.substring(18, 20);
            console.log('pIN dec : ' + pIN);
            var pOUT = 0;

            start = 20;
          } else if (personchannel == "03") {
            var pOUT = payload_hex.substring(18, 20);
            console.log('pOUT dec : ' + pOUT);
            var pIN = 0;

            start = 20;
          }
        } else if (end <= "16") {
          var pIN = 0;
          var pOUT = 0;
        }
      }
    } else {
      console.log("Error");
    }
    payload_hex = payload_hex.substring(start, end);
    start = 0;
    end = payload_hex.length;

    payload_hex = payload_hex.substring(start, end);
    start = 0;
    end = payload_hex.length;

    db.SensorData.insert({
      "Temperature" : tempdec,
      "Humidity" : humdec,
      "PIN" : pIN ,
      "POUT" : pOUT ,
      "TimeStamp" : timestamp
    });
  } while (end > 1);

  console.log('_____');
}


function hexToInt(hex) {
  if (hex.length % 2 != 0) {
    hex = "0" + hex;
  }
  var num = parseInt(hex, 16);
  var maxVal = Math.pow(2, hex.length / 2 * 8);
  if (num > maxVal / 2 - 1) {
    num = num - maxVal
  }
  return num;
}

//Get all user
app.get('/showData', function (req, res) {
  db.SensorData.find(function (err, docs) {
    console.log(docs);
    res.send(docs);
  });
})
//Add Data
app.post('/addData', function (req, res) {
  var json = req.body;
  db.SensorData.insert(json, function (err, docs) {
    console.log(docs);
    res.send(docs);
  });
})


var server = app.listen(8080, function () {
  var port = server.address().port

  console.log("Sample Code for RESTful API run at ", port)
})
