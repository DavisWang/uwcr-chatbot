var http = require("http");
var key = "59936cbc7642729f6f519c130c530bdd";
var baseUrl = "api.uwaterloo.ca";

function process (command, callback) {
  //command format should be "@uwbot <commands> <parameters>"
  /**
   * Commands accepted:
   * weather
   * help
   **/

  var args = command.split(" ");
  switch(args[1]) {
    case "weather":
      getWeather(function (data) {
        callback(data);
      });
      break;
    case "exam":
      if(args.length == 4) {
        getExamSchedule(args[2], args[3], function (data) {
          callback(data);
        });
      }
      else {
        callback(returnHelpString());
      }
      break;
    case "help":
      callback("Address bot with <b>@uwbot</b> or <b>@bot</b> (command) (options) <br> \
        <b>UWBot commands:</b> <br> \
          <b>weather</b>: get the current weather in waterloo <br> \
          <b>exam</b> (subject) (course_num): Gets exam info for given subject <br> \
          <b>disclaimer</b>: Prints a boring disclaimer <br> \
          <b>help</b>: print this help command <br>");
      break;
    case "disclaimer":
      callback("All information from api.uwaterloo.ca, the author provides no guarentees to its correctness.");
      break;
    default:
      callback(returnHelpString());
      break;
  }
}

function returnHelpString() {
  return "Unrecognized command, please refer to '@bot help' for accepted command.";
}

function getCurrentTerm(callback) {
  var url = "/v2/terms/list.json" + "?key=" + key;
  var parsedResponse;
  sendReq(url, function (response) {
    parsedResponse = JSON.parse(response);
    callback(parsedResponse.data.current_term);
  });
}

function getExamSchedule(subj, num, callback) {
  var url = "/v2/courses/" + subj + "/" + num + "/examschedule.json" + "?key=" + key;
  var responseStr;
  var parsedResponse;
  sendReq(url, function (response) {
    parsedResponse = JSON.parse(response);
    if(typeof parsedResponse.data.course !== "undefined") {
      responseStr = "Exam Info for " + parsedResponse.data.course + ": <br>";
      for(section in parsedResponse.data.sections) {
        responseStr += "Section: " + parsedResponse.data.section.section + "<br> \
        Date: " + parsedResponse.data.section.date + "<br> \
        Start Time: " + parsedResponse.data.section.start_time + "<br> \
        End Time: " + parsedResponse.data.section.end_time + "<br> \
        Location: " + parsedResponse.data.section.location + "<br> \
        ";
      }
    }
    else {
      responseStr = "Cannot get exam information for '" + subj + num + "'!";
    }
    callback(responseStr);
  });
}

function getWeather(callback) {
  var url = "/v2/weather/current.json";
  var responseStr;
  var parsedResponse;
  sendReq(url, function (response) {
    parsedResponse = JSON.parse(response);
    responseStr = "The current temperature in Waterloo is: " + parsedResponse.data.temperature_current_c + " Celsius";
    callback(responseStr);
  });
}

function sendReq(url, callback) {
  var options = {
    host: baseUrl,
    port: 80,
    path : url,
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  };
  var req = http.get(options, function(res) {

  // Buffer the body entirely for processing as a whole.
  var bodyChunks = [];
  res.on('data', function(chunk) {
    // You can process streamed parts here...
    bodyChunks.push(chunk);
  }).on('end', function() {
    var body = Buffer.concat(bodyChunks);
    callback(body);
  });
  });

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });
}

module.exports.process = process;