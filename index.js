// SPOTIFY API KEYS
const client_id="a92d9285d08c4251a961f131f4d5a7e3";
const client_secret="5b940d3589bb4ac0adbc0e8659956119";

// GOOGLE API KEYS
const googleKey = "AIzaSyCFg1JfRS2aLE62yvRRUn_0H8hM8TFlMfU";
const searchId = '45be702f0fcb74fa0';

// URLS
const baseurl="https://api.spotify.com/v1/";
const redirect_uri = "http://mtw2001.github.io/spotitube-final";

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";

// HTML interactions on page load
$(document).ready(function(){
    // Log in/Log out functionality
    $('#login').click(function(){
        if (localStorage.getItem("access_token") && localStorage.getItem("refresh_token")) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            $('#login').text("Log in");
            window.location.reload();
        } else {
            requestAuthorization();  
        }
    });

    // Dark Mode
    if (localStorage.getItem("darkmode") == "true") {
        document.getElementById("darkmode").checked = true;
        $("body").css("background", "black");
        $("body").css("color", "white");
    } else {
        document.getElementById("darkmode").checked = false;
        $("body").css("background", "white");
        $("body").css("color", "black");
    }
    $('#darkmode').click(function() {
        if($('#darkmode').is(':checked')) { //on
            console.log("true");
            localStorage.setItem("darkmode", "true");
            $("body").css("background", "black");
            $("body").css("color", "white");
        } else { // off
            console.log("false");
            localStorage.setItem("darkmode", "false");
            $("body").css("background", "white");
            $("body").css("color", "black");
        }
    });

    // Handle redirect after authorizing Spotify account
    var currentURL = $(location).attr('href');
    if (currentURL.length > 50) {
        var code = currentURL.split("=")[1];
        fetchAccessToken(code);
    }

    // State management
    if (localStorage.getItem("access_token") && localStorage.getItem("refresh_token")) {
        $('#login').text("Log out");
        console.log("User is connected to Spotify");
        console.log("Access token is: " + localStorage.getItem("access_token"));
        getCurrentlyPlaying();
    } else {
        console.log("User is not connected to Spotify");
        $('#songtitle').hide();
        $('#video').hide();
        $('#footerinfo').hide();
        $('#instructions').show();
        $('#logo').show();
    }
});

function getCurrentlyPlaying() {
    $.ajax({
        url: baseurl + "me/player/currently-playing",
        type: 'GET',
        headers: {
            'Authorization' : 'Bearer ' + localStorage.getItem("access_token")
        },
        success: function(data) {
            console.log(data);
            if (data == undefined) {
                console.log("data came back undefined");
            } else {
                var currentlyPlaying = data['item']['name'] + " by ";
                var artists = data['item']['artists'];
                currentlyPlaying += artists[0]['name'];
                if (artists.length > 1) {
                    for (let i = 1; i < artists.length; i++) {
                        currentlyPlaying += ", " + artists[i]['name'];
                    }
                }
                console.log(currentlyPlaying);
                localStorage.setItem("progress", (Math.round(data['progress_ms'] / 1000)));
                localStorage.setItem("currentlyPlaying", currentlyPlaying);
                playVideo();
            }
        }
    });
}

function playVideo() {
    $('#songtitle').text(localStorage.getItem("currentlyPlaying"));
    console.log("search ran");
    var searchURL = "https://www.googleapis.com/customsearch/v1?key=" + googleKey 
        + "&cx=" + searchId + "&q=" + encodeURIComponent(localStorage.getItem("currentlyPlaying"))
        + "&num=1";
    console.log(searchURL);
    $.ajax({
        url: searchURL,
        type: "GET",
        success: function(data) {
            var videoCode = data['items'][0]['formattedUrl'];
            console.log(videoCode);
            //https://www.youtube.com/embed/_r-nPqWGG6c?start=0&autoplay=1&mute=0
            //https://www.youtube.com/watch?v=GdAlCXNPlCk
            videoCode = videoCode.split("=")[1];
            console.log(videoCode);
            document.getElementById('video').src = "https://www.youtube.com/embed/" +
                videoCode + "?start=" + localStorage.getItem("progress") + "&autoplay=1&mute=1";
            $('#songtitle').show();
            $('#video').show();
            $('#footerinfo').show();
            $('#instructions').hide();
            $('#logo').hide();
        }
    });
}

// User authorizes site to use Spotify Account
function requestAuthorization() {
    window.location.href = AUTHORIZE + "?client_id=" + client_id + "&response_type=code" + "&redirect_uri=" + 
    encodeURI(redirect_uri) + "&show_dialog=true" + "&scope=user-read-currently-playing";
}

// User has authorized and code retrieved --> get token
function fetchAccessToken(code) {
    $.post(
        TOKEN, 
        {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: encodeURI(redirect_uri),
            client_id: client_id,
            client_secret: client_secret
        },
        function(data, status) {
            localStorage.setItem("access_token", data['access_token']);
            localStorage.setItem("refresh_token", data['refresh_token']);
            window.location.href = redirect_uri;
        }    
    );
}
