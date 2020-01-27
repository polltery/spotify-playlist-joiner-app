/*jshint esversion: 6*/
document.title = config.appTitle;
var app = new Vue({
	el: '#app',
	data: {
		appTitle : config.appTitle,
		playlist1Url : "37i9dQZF1DXec50AjHrNTq",
		playlist2Url : "37i9dQZF1DX6RSJAsEDz7H",
		playlistFetchErrors : "",
		playlist1 : {},
		playlist2 : {},
		authHeaders : {},
		joinedPlaylist : [],
		joinedPlaylistErrors : ""
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
		fetchPlaylists: function(){
			// todo: fetch using complete url, for now just use the ids
			if(this.playlist1Url !== "" && this.playlist2Url !== ""){
				var url = config.apiUrl + "/playlists/" + this.playlist1Url;
				this.$http.get(url, this.authHeaders).then(response => {
					this.playlist1 = response.body;
					this.playlist1Url = response.body.name;
				}, response => {
					console.error("There was an error while fetching " + url);
					this.joinedPlaylistErrors = "Unable to fetch playlist data, try connecting to spotify again.";
				});
				url = config.apiUrl + "/playlists/" + this.playlist2Url;
				this.$http.get(url, this.authHeaders).then(response => {
					this.playlist2 = response.body;
					this.playlist2Url = response.body.name;
				}, response => {
					console.error("There was an error while fetching " + url);
				});
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
		}
	}
});