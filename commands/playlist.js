// TODO

const play = require('./play')
const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports.data =
    new SlashCommandBuilder()
        .setName("playlist")
        .setDescription("Odtwarza playlistę z yt")

function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
        .then(function() { console.log("Sign-in successful"); },
            function(err) { console.error("Error signing in", err); });
}

function loadClient() {
    gapi.client.setApiKey("YOUR_API_KEY");
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
            function(err) { console.error("Error loading GAPI client for API", err); });
}


module.exports.run = async (bot, message, args) =>{
    // Make sure the client is loaded and sign-in is complete before calling this method.
    function execute() {
        return gapi.client.youtube.playlistItems.list({
            "part": [
                "contentDetails"
            ],
            "maxResults": 50,
            "playlistId": "PLbZDz1wfU8diMkS1NwCSdkX3S5byvoPJR"
        })
            .then(function(response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log("Response", response);
                },
                function(err) { console.error("Execute error", err); });
    }
    gapi.load("client:auth2", function() {
        gapi.auth2.init({client_id: "YOUR_CLIENT_ID"});
    });
}

module.exports.help = {
    name: "playlist",
}
