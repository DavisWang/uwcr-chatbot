var bot = require("./src/uwbot.js")

//replace weather with command
var command = "@bot " + "weather";

bot.process(command, function (data) {
	console.log(data);
});