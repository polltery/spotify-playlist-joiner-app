/*jshint esversion: 6*/
document.title = config.appTitle;
var app = new Vue({
	el: '#app',
	data: {
		appTitle : config.appTitle,
		playlist1Url : "37i9dQZF1DXec50AjHrNTq",
		playlist2Url : "3mrM0ZsJ9o5qFYJT6IdpoH",
		playlistFetchErrors : "",
		playlist1 : {},
		playlist2 : {},
		authHeaders : {},
		joinedPlaylist : [],
		joinedPlaylistErrors : "",
		showSongsFromPlaylist : false,
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
				this.fetchTracks(this.playlist1Url, '1');
				this.fetchTracks(this.playlist2Url, '2');
			}else{
				this.playlistFetchErrors = "Both URLs are mandatory";
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
				console.error("There was an error while fetching " + url);
				this.playlistFetchErrors += "\nUnable to fetch playlist data, try connecting to spotify again.";
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