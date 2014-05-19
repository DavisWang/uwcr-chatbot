var http = require("http");
var key = "59936cbc7642729f6f519c130c530bdd";
var baseUrl = "api.uwaterloo.ca";

function process (command, callback) {
  //command format should be "@uwbot <commands> <parameters>"
  /**
   * Commands accepted:
   * weather
   * holiday
   * exam
   * help
   * disclaimer
   **/
  try {
    var i = command.indexOf(" ");
    var args;
    var str;
    if(i == -1) {
      args = str = "";
    }
    else {
      // space delimited args
      args = command.split(" ");

      // the entire string after the '@botname ', is empty string unless '@botname ' is followed by one or more chars
      str = i == -1 ? "" : command.substr(i + 1);
    }

    switch(args[1]) {
      case "weather":
        if(args.length == 2) {
          getWeather(function (data) {
            callback(data);
          });
        }
        else {
          callback(returnHelpString());
        }
        break;
      case "holiday":
        if(args.length == 2) {
          getNextHoliday(function (data) {
            callback(data);
          });
        }
        else {
          callback(returnHelpString());
        }
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
      case "number":
        if(args.length == 3 && parseInt(args[2]) == args[2]) {
          getNumberTrivia(args[2], function (data) {
            callback(data);
          })
        }
      break;
      case undefined:
      case "help":
        callback("Address bot with <b>@uwbot</b> or <b>@bot</b> (command) (options) <br> \
          <b>UWBot commands:</b> <br> \
            <b>weather</b>: get the current weather in waterloo <br> \
            <b>exam</b> (subject) (course_num): Gets exam info for given subject <br> \
            <b>holiday</b>: Get the date of the next holiday! <br> \
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
  } catch (err) {
    console.log("UWBot has encountered an error: " + err);
    callback("Uh-oh! Something has gone wrong! Please try again later!");
  }
}

function returnHelpString() {
  return "Unrecognized command, please refer to '@bot help' for accepted commands.";
}

function getNumberTrivia(number, callback) {
  var found = false;
  ["trivia", "year", "math"].map(function (str) {
    var url = "/" + parseInt(number) + "/" + str;
    //override baseUrl value
    sendReq("numbersapi.com", url, function (response) {
      if(!found && response.found) {
        found = true;
        callback(response.text);
      }
      else if (!found && !response.found && str === "trivia") {
        callback("Cannot find a factoid about " + parseInt(number));
      }
    });
  });
}

function getNextHoliday(callback) {
  var url = "/v2/events/holidays.json";
  sendReq(baseUrl, url, function (response) {
    if(response.meta.status == 200) {
      var holiday;
      var date = new Date();
      for (index in response.data) {
        if(new Date(response.data[index].date) > date) {
          holiday = response.data[index];
          break;
        }
      }
      if(typeof holiday !== "undefined") {
        callback("The next holiday is " + holiday.name + " on " + holiday.date + ". Yay!");
      }
    }
    else {
      callback("Cannot find the next holiday, maybe there is none... :(");
    }
  });
}

function getCurrentTerm(callback) {
  var url = "/v2/terms/list.json" + "?key=" + key;
  sendReq(baseUrl, url, function (response) {
    if(response.meta.status == 200) {
      callback(response.data.current_term);
    }
  });
}

function getExamSchedule(subj, num, callback) {
  var url = "/v2/courses/" + subj + "/" + num + "/examschedule.json" + "?key=" + key;
  var responseStr;
  sendReq(baseUrl, url, function (response) {
    if(response.meta.status == 200 && typeof response.data.course !== "undefined") {
      responseStr = "Exam Info for " + response.data.course + ": <br>";
      for(section in response.data.sections) {
        responseStr += "Section: " + response.data.section.section + "<br> \
        Date: " + response.data.section.date + "<br> \
        Start Time: " + response.data.section.start_time + "<br> \
        End Time: " + response.data.section.end_time + "<br> \
        Location: " + response.data.section.location + "<br> \
        ";
      }
    }
    else {
      responseStr = "Cannot find exam information for '" + subj + num + "'! Exam schedule is not up or no exams for this course ;)";
    }
    callback(responseStr);
  });
}

function getWeather(callback) {
  var url = "/v2/weather/current.json";
  var responseStr;
  sendReq(baseUrl, url, function (response) {
    if(response.meta.status == 200) {
      responseStr = "The current temperature in Waterloo is: " + response.data.temperature_current_c + " Celsius";
      callback(responseStr);
    }
    else {
      callback("Cannot get weather info for Waterloo...");
    }

  });
}

function sendReq(baseUrl, url, callback) {
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
    callback(JSON.parse(body));
  });
  });

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });
}

module.exports.process = process;
