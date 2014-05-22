var bot = require("./src/uwbot.js")

//replace weather with command
var command = "@bot " + "news";

bot.process(command, function (data) {
	console.log(data);
});