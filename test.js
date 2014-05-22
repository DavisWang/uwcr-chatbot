var bot = require("./src/uwbot.js")

//replace weather with command
var command = "@bot " + "courseinfo " + "CS " + "350";

bot.process(command, function (data) {
	console.log(data);
});
