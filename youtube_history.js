/*Pasos:
-Obtener ID hisotiral usuario:
 GET https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true&key={YOUR_API_KEY}
- Mi id: HLkFeJSUtoRQWYgQ9AJMYYRQ

- Obtener videos de la playlist:
 GET https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=HLkFeJSUtoRQWYgQ9AJMYYRQ&key={YOUR_API_KEY}
*/


// Define some variables used to remember state.
var playlistId, nextPageToken, prevPageToken;

// After the API loads, call a function to get the uploads playlist ID.
function handleAPILoaded() {
	$("#divCargando").show();
	requestUserUploadsPlaylistId(); 
}

// Call the Data API to retrieve the playlist ID that uniquely identifies the
// list of videos uploaded to the currently authenticated user's channel.
function requestUserUploadsPlaylistId() {
  // See https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.channels.list({
    mine: true,
    part: 'contentDetails'
  });
  request.execute(function(response) {
  //console.log(response);
    playlistId = response.result.items[0].contentDetails.relatedPlaylists.watchHistory;
	//playlistId = 'HLkFeJSUtoRQWYgQ9AJMYYRQ';
    requestVideoPlaylist(playlistId);
  });
}
/*
Ejemplo item (video)

{  
   "kind":"youtube#playlistItem",
   "etag":"\"I_8xdZu766_FSaexEaDXTIfEWc0/51gRMkaR4vJ9ZoPfUYVgA5kxSYg\"",
   "id":"SExrRmVKU1V0b1JRV1lnUTlBSk1ZWVJRLmQ5QUtiYWVlY0tJ",
   "snippet":{  
      "publishedAt":"2016-07-30T16:29:11.000Z",
      "channelId":"UCkFeJSUtoRQWYgQ9AJMYYRQ",
      "title":"ANDY SVGE - Gravity | Dragonblood EP",
      "description":"TEXTO_DESCRIPCION",
      "thumbnails":{  
         "default":{  
            "url":"https://i.ytimg.com/vi/d9AKbaeecKI/default.jpg",
            "width":120,
            "height":90
         },
         "medium":{  
            "url":"https://i.ytimg.com/vi/d9AKbaeecKI/mqdefault.jpg",
            "width":320,
            "height":180
         },
         "high":{  
            "url":"https://i.ytimg.com/vi/d9AKbaeecKI/hqdefault.jpg",
            "width":480,
            "height":360
         },
         "standard":{  
            "url":"https://i.ytimg.com/vi/d9AKbaeecKI/sddefault.jpg",
            "width":640,
            "height":480
         },
         "maxres":{  
            "url":"https://i.ytimg.com/vi/d9AKbaeecKI/maxresdefault.jpg",
            "width":1280,
            "height":720
         }
      },
      "channelTitle":"Gonzalo hdez",
      "playlistId":"HLkFeJSUtoRQWYgQ9AJMYYRQ",
      "position":600,
      "resourceId":{  
         "kind":"youtube#video",
         "videoId":"d9AKbaeecKI"
      }
   }
}


*/
// Retrieve the list of videos in the specified playlist.
var numVideos = 0;
function requestVideoPlaylist(playlistId, pageToken) {
  //$('#video-container').html('');
  var requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 50
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.playlistItems.list(requestOptions);
  request.execute(function(response) {
  //console.log(response);
    // Only show pagination buttons if there is a pagination token for the
    // next or previous page of results.
    nextPageToken = response.result.nextPageToken;
    var nextVis = nextPageToken ? 'visible' : 'hidden';
    $('#next-button').css('visibility', nextVis);
    prevPageToken = response.result.prevPageToken
    var prevVis = prevPageToken ? 'visible' : 'hidden';
    $('#prev-button').css('visibility', prevVis);

    var playlistItems = response.result.items;
    if (playlistItems) {
      $.each(playlistItems, function(index, item) {
        displayResult(item.snippet);
      });
    } else {
      $('#video-container').html('Sorry you have no videos in your history');
    }
	//console.log(nextPageToken);
	if(nextPageToken)
		nextPage();
	else{
		console.log('fin, total videos: '+ numVideos);	
		videosCargados(numVideos);
	}
		
  });

}
function videosCargados(numVideos){
	var options = {
	valueNames: ['titulo']
	};
	var userList = new List('video-container', options);
	$("#video-container .search").show();
	$("#divCargando").hide();
	$("#divEstadisticas").html('<span>Total Videos: '+numVideos+'</span>');
}
// Create a listing for a video.
function displayResult(videoSnippet) {
numVideos = numVideos+1;
  var title = videoSnippet.title;
  var videoId = videoSnippet.resourceId.videoId;
  //console.log(videoSnippet);
  var urlImg  = videoSnippet.thumbnails == undefined ? 'https://i.ytimg.com/vi/OvSuLnybXz4/mqdefault.jpg' : videoSnippet.thumbnails.medium.url;
  var urlVideo = 'https://www.youtube.com/watch?v='+videoSnippet.resourceId.videoId;
  //var urlImg = (videoSnippet.thumbnails.medium.url || 'https://i.ytimg.com/vi/OvSuLnybXz4/mqdefault.jpg');
  $('#video-container ul').append(
	'<li>'+
		'<span class="titulo" style="display:none;">'+title+'</span>'+
			'<div class="cuadroVideo">'+
				'<a target="_blank" href="'+urlVideo+'">'+
					'<div class="contenidoVideo">'+
						'<img src="'+urlImg+'" class="imgVideo">'+
						'<p>' + title +'</p>'+ //+ ' - ' + videoId + 
					'</div>'+
				'</a>'+
			'</div>'+
	'</li>');
}

// Retrieve the next page of videos in the playlist.
function nextPage() {
  requestVideoPlaylist(playlistId, nextPageToken);
}

// Retrieve the previous page of videos in the playlist.
function previousPage() {
  requestVideoPlaylist(playlistId, prevPageToken);
}