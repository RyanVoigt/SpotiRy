var topSongs
var topArtists
var following
var songArray = []
var uriArray = []
var artistArray = []
var imageArray = []
/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  

function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

var userProfileSource = document.getElementById('user-profile-template').innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById('user-profile');

/** USING A VARIABLE TO REPRESENT THE BODY HTML ABOVE SO I CAN FILL IT USING AJAX
* */
var followingSource = document.getElementById('following-template').innerHTML,
    followingTemplate = Handlebars.compile(followingSource),
    followingPlaceholder = document.getElementById('following');
    
var tracksSource = document.getElementById('tracks-template').innerHTML,
    tracksTemplate = Handlebars.compile(tracksSource),
    tracksPlaceholder = document.getElementById('tracks');

var artistSource = document.getElementById('artist-template').innerHTML,
    artistTemplate = Handlebars.compile(artistSource),
    artistPlaceholder = document.getElementById('artist');

var cardSource = document.getElementById('card-template').innerHTML,
    artistTemplate = Handlebars.compile(cardSource),
    cardPlaceholder = document.getElementById('songcard1');

var params = getHashParams();

var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

function parseFollowedArtists(resp) {
    return resp.artists.items.map((artist) => {
    return {
        name: artist.name,
        genres: artist.genres,
        image: artist.images[0].url,
        uri:artist.uri
    }
    });
}
function parseMidTracks(resp) {
    return resp.map((item) => {
        songArray.push(item.name);
        uriArray.push(item.uri)
        imageArray.push(item.image)
        artistArray.push(item.artist)
    });
}
function parseTopTracks(resp) {
    return resp.items.map((song) => {
    return {
        name: song.name,
        artist: song.album.artists,
        image: song.album.images[0].url,
        uri: song.uri,
        album: song.album.name
    }
    });
}
function parseTopArtist(resp) {
    return resp.items.map((artist) => {
    return {
        name: artist.name,
        image: artist.images[0].url,
        uri: artist.uri,
    }
    });
}
function parseTopRecTracks(resp) {
    return resp.items.map((song) => {
    return {
        name: song.name,
        artist: song.album.artists[0].name,
        image: song.album.images[0].url,
        uri: song.uri,
    }
    });
}

function generateFollowedArtistsListElems(arr) {
    return arr.map((item) => {
    chips = item.genres.reduce((elems, genre) => {
        return elems + `<span class="badge pull-right" style="margin: 0 2px;">${genre}</span>`
    }, "");

    return `
    <div style = "width: 160px; display: inline-block; margin: 10px; vertical-align: top;">
        <a href="${item.uri}"><img class="center-image"; src="${item.image}"; style="width: 160px; height: 160px; border-radius:10%"></a>
        <div style = "font-size: 18px;color: white; position: relative; text-align:center; vertical-align: middle; margin-top: 5px;">
        ${item.name}
        </div>
    </div>
    `;
    });
}
function generateTopTracksListElems(arr) {
    return arr.map((item) => {
    chips = item.artist.reduce((elems, name) => {
        return name.name
    }, "");
    songArray.push(item.name);
    uriArray.push(item.uri)
    imageArray.push(item.image)
    artistArray.push(item.artist[0].name)
    return `
        <div style = "background-color: #1f1f1f; border-width: 3px; border-radius: 14px; border-color: #252525 ;";  class="panel panel-default">
        <a href="${item.uri}"><img class="center-image"; src="${item.image}"; style="width: 100px; height: 100px; border-radius:10%"></a>
        <div style = "padding: 0; vertical-align: middle; color: #b3b3b3; font-size: 13px;font-weight: bold; display: inline-block" class="panel-body">
            <ul style="list-style-type:none; padding-left: 5px">
            <li style = "font-size: 18px">${item.name}</li>
            <li>Album: ${item.album}</li>
            <li>Artist: ${chips}</li>
            </ul>  
            </div>
        </div>
    `;
    });
}
function generateTopArtistListElems(arr) {
    return arr.map((item) => {

    return `
        <div style = "background-color: #1f1f1f; border-width: 3px; border-radius: 14px; border-color: #252525 ;";  class="panel panel-default">
        <a href="${item.uri}"><img class="center-image"; src="${item.image}"; style="width: 100px; height: 100px; border-radius:10%"></a>
        <div style = "padding: 0; vertical-align: middle; color: #b3b3b3; font-size: 15px;font-weight: bold; display: inline-block" class="panel-body">
            <ul style="list-style-type:none; padding-left: 5px">
            <li style = "font-size: 25px">${item.name}</li>
            </ul>  
            </div>
        </div>
    `;
    });
}
function generateTopTrackmidListElems(arr) {
    return arr.map((item) => {
        songArray.push(item.name);
        uriArray.push(item.uri)
        return `
            <div style = "background-color: #1f1f1f; border-width: 3px; border-radius: 14px; border-color: #252525 ;";  class="panel panel-default">
            <a href="${item.uri}"><img class="center-image"; src="${item.image}"; style="width: 100px; height: 100px; border-radius:10%"></a>
            <div style = "padding: 0; vertical-align: middle; color: #b3b3b3; font-size: 15px;font-weight: bold; display: inline-block" class="panel-body">
                <ul style="list-style-type:none; padding-left: 5px">
                <li style = "font-size: 25px">${item.name}</li>
                </ul>  
                </div>
            </div>
        `;
    });
}

if (error) {
    alert('There was an error during the authentication');
} else {
    if (access_token) {
    $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
            userProfilePlaceholder.innerHTML = userProfileTemplate(response);

            $('#login').hide();
            $('#loggedin').show();
        }
    });
    /** 
     * USING AJAX TO FILL THE VARIABLE WE MADE ABOVE FOR FOLLOWING ARTIST WITH A API REQUEST RESPONSE
    **/
    $.ajax({
        url: 'https://api.spotify.com/v1/me/following?type=artist',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
            following = response;
            artists = parseFollowedArtists(response);
            elements = generateFollowedArtistsListElems(artists);
            $(followingPlaceholder).append(elements);
        }
    })
    $.ajax({
        url: 'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
            topSongs = response;
            songs = parseTopTracks(response);
            elements = generateTopTracksListElems(songs);
            $(tracksPlaceholder).append(elements);
        }
    })
    $.ajax({
        url: 'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
            topArtists = response;
            artist = parseTopArtist(response);
            elements = generateTopArtistListElems(artist);
            $(artistPlaceholder).append(elements);
        }
    })
    $.ajax({
        url: 'https://api.spotify.com/v1/me/top/tracks?limit=50',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
            tracks = parseTopRecTracks(response);
            parseMidTracks(tracks)
        }
    })
    } else {
        // render initial screen
        $('#login').show();
        $('#loggedin').hide();
    }
}
function regenerate(){

}
$('#songcard1').click(function(){
    
    var element = `
    <div style = "padding-top: 10px; margin:auto; width: 50%; border-radius: 18px";>
    <a href="${uriArray[0]}"><img src="${imageArray[0]}"; style="width: 100%; height:100%; border-radius: 18px "></a>
    </div>
    <div style = "padding: 0; vertical-align: middle; color: #b3b3b3; font-size: 15px;font-weight: bold; display: inline-block" class="panel-body">
        <ul style="list-style-type:none; padding-left: 5px">
        <li style = "font-size: 25px">${songArray[0]}</li>
        </ul>  
        </div>
    
`
    $(cardPlaceholder).append(element);
});
$('#songcard2').click(function(){

});
$('#songcard3').click(function(){

});
$('#songcard4').click(function(){

});

document.getElementById("interestsButton").addEventListener("click", function(){
    document.getElementById("mainPage").style = "display: block";
    document.getElementById("queueCreator").style = "display: none";
});
document.getElementById('queueCreatorButton').addEventListener("click",  function(){
    document.getElementById("mainPage").style = "display: none";
    document.getElementById("queueCreator").style = "display: block";
});

