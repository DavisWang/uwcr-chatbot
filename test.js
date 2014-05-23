var bot = require("./src/uwbot.js")

//replace weather with command
var command = "@bot " + "courseinfo " + "CS " + "499r";

bot.process(command, function (data) {
	console.log(data);
});
