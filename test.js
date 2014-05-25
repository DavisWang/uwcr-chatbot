var bot = require("./src/uwbot.js")

//replace weather with command
var command = "@bot " + "course CS 492";

bot.process(command, function (data) {
	console.log(data);
});