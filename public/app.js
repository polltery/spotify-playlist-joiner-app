/*jshint esversion: 6*/
document.title = config.appTitle;
var app = new Vue({
	el: '#app',
	data: {
		appTitle : config.appTitle,
		playlist1Url : "https://open.spotify.com/playlist/3mrM0ZsJ9o5qFYJT6IdpoH?si=IXP89EyfScK-1ix8fRnf7A",
		playlist2Url : "https://open.spotify.com/playlist/6ff5TfwljOgOP3hZIBofqw?si=SeCzKAafTOyJ2YREjeDG5Q",
		playlistFetchErrors : "",
		playlist1 : {},
		playlist2 : {},
		authHeaders : {},
		joinedPlaylist : [],
		joinedPlaylistErrors : "",
		showSongsFromPlaylist : false,
		reAuthRequired : false
	},
	methods: {
		doAuth: function(){
			window.location.href = config.authUrl+"?client_id="+config.clientId+"&redirect_uri="+config.redirectUri+"&response_type="+config.responseType;
		},
		isAuthCompleted: function(){
			// todo: refactor to check localStorage first
			var hashParams = this.getHashParams();
			if(hashParams.access_token !== undefined){
				config.accessToken = hashParams.access_token;
				config.tokenType = hashParams.token_type;
				config.expiresIn = hashParams.expires_in;
				this.authHeaders = {
					headers: {
						Authorization: config.tokenType + " " + config.accessToken
					}
				};
				return true;
			}else{
				return false;
			}
		},
		// todo: fetch more than 100 items
		fetchPlaylists: function(){
			// todo: fetch using complete url, for now just use the ids
			this.playlistFetchErrors = "";
			if(this.playlist1Url !== "" && this.playlist2Url !== ""){
				var idMatch1 = [];
				var idMatch2 = [];
				try{
					idMatch1 = this.playlist1Url.match(/https\:\/\/.*spotify\.com.*playlist\/(.*?)(\?|$|\/)/);
					idMatch2 = this.playlist2Url.match(/https\:\/\/.*spotify\.com.*playlist\/(.*?)(\?|$|\/)/);
						if(idMatch1[1] !== null && idMatch2[1] !== null){
							this.fetchTracks(idMatch1[1], '1');
							this.fetchTracks(idMatch2[1], '2');
						}else{
							this.playlistFetchErrors = "Invalid URL.";
						}
				} catch (e){
					this.playlistFetchErrors = "Invalid URL.";
				}
			}else{
				this.playlistFetchErrors = "Both URLs are mandatory.";
			}
		}, 
		getHashParams: function() {
			var hashParams = {};
			var e, r = /([^&;=]+)=?([^&;]*)/g,
				q = window.location.hash.substring(1);
			while ( e = r.exec(q)) {
			   hashParams[e[1]] = decodeURIComponent(e[2]);
			}
			return hashParams;
		},
		joinPlaylists: function(){
			this.joinedPlaylistErrors = "";
			this.joinedPlaylist = [];
			if(this.playlist1.tracks !== undefined && this.playlist2.tracks !== undefined){
				var list1 = this.playlist1.tracks.items;
				var list2 = this.playlist2.tracks.items;
				for(let i = 0; i < list1.length; i++){
					for(let j = 0; j < list2.length; j++){
						if(list1[i].track.id === list2[j].track.id){
							this.joinedPlaylist.push(list1[i].track);
						}
					}
				}
				if(this.joinedPlaylist.length < 1){
					this.joinedPlaylistErrors = "No common tracks were found between the two playlists.";
				}
			}else{
				this.joinedPlaylistErrors = "One of the playlist is missing tracks.";
			}
		},
		fetchTracks: function(playlistId, playlistN){
			url = config.apiUrl + "/playlists/" + playlistId;
			this.$http.get(url).then(response => {
				this['playlist' + playlistN] = response.body;
				if(response.body.tracks.next !== null){
					this.fetchReminaingTracks(response.body.tracks.next, playlistN);
				}
			}, response => {
				if(response.status === 401){
					this.reAuthRequired = true;
				}else{
					this.playlistFetchErrors += "\nPlaylist " + playlistN + ": Unable to fetch playlist data.";
				}
				console.error("There was an error while fetching " + url);
			});
		},
		fetchReminaingTracks: function(nextUrl, playlistN){
			this.$http.get(nextUrl).then(response => {
				this['playlist' + playlistN].tracks.items = this['playlist' + playlistN].tracks.items.concat(response.body.items);
				if(response.body.next !== null){
					this.fetchReminaingTracks(response.body.next, playlistN);
				}
			}, response => {
				console.error("There was an error while fetching " + url);
				this.playlistFetchErrors += "\nSomething went wrong while trying to fetch remaining tracks.";
			});
		}
	}
});

Vue.http.interceptors.push(function(request) {
	request.headers.set('Authorization', config.tokenType + " " + config.accessToken);
});