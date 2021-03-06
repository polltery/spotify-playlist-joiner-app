/*jshint esversion: 6*/
document.title = config.appTitle;

Vue.component('playlist-viewer', {
	props: ['source','viewcondition'],
	template: '<div class="col-md" v-if="source.tracks !== undefined"><h3><a v-bind:href="source.external_urls.spotify" target="_blank">{{source.name}}</a></h3><ul class="list-group"><li class="list-group-item" v-show="viewcondition" v-for="(item, index) in source.tracks.items">{{index+1}}. <span v-for="artist in item.track.artists"><a v-bind:href="artist.external_urls.spotify" target="_blank" class="badge badge-light">{{artist.name}}</a></span> <a v-bind:href="item.track.external_urls.spotify" target="_blank">{{item.track.name}}</a></li><li class="list-group-item" v-show="!viewcondition">Songs are hidden.</li></ul></div>'
});

Vue.component('playlist-url-input', {
	props: ['id','label','onclickfn','value'],
	template: '<div><label v-bind:for="id">{{label}}</label><button v-on:click="$emit(\'onclickfn\')" class="btn btn-outline-success btn-sm">Open</button><input v-bind:value="value" v-on:input="$emit(\'input\',$event.target.value)" type="text" class="form-control mb-3" v-bind:id="id"></div>'
});

var app = new Vue({
	el: '#app',
	data: {
		appTitle : config.appTitle,
		playlist1Url : "https://open.spotify.com/playlist/3mrM0ZsJ9o5qFYJT6IdpoH?si=IXP89EyfScK-1ix8fRnf7A",
		playlist2Url : "https://open.spotify.com/playlist/6ff5TfwljOgOP3hZIBofqw?si=SeCzKAafTOyJ2YREjeDG5Q",
		playlistFetchErrors : "",
		playlist1 : {},
		playlist2 : {},
		joinedPlaylist : [],
		joinedPlaylistErrors : "",
		showSongsFromPlaylist : false,
		reAuthRequired : false,
		isJoinPlaylistsInProgress : false,
		isFetchPlaylist1InProgress : false,
		isFetchPlaylist2InProgress : false,
		isFetchPlaylistsInProgress : false,
		fetchedTracks : 0,
		totalTracks : 0,
		user : {},
		joinedPlaylistId : "",
		joinedPlaylistExternalUrl : "",
		joinedPlaylistName : ""
	},
	methods: {
		doAuth: function(){
			window.location.href = config.authUrl+"?client_id="+config.clientId+"&redirect_uri="+config.redirectUri+"&response_type="+config.responseType+"&scope="+config.scope;
		},
		isAuthCompleted: function(){
			var hashParams = this.getHashParams();
			if(hashParams.access_token !== undefined){
				config.accessToken = hashParams.access_token;
				config.tokenType = hashParams.token_type;
				config.expiresIn = hashParams.expires_in;
				return true;
			}else{
				return false;
			}
		},
		fetchPlaylists: function(){
			this.playlistFetchErrors = "";
			this.playlist1 = {};
			this.playlist2 = {};
			this.joinedPlaylist = [];
			this.totalTracks = 0;
			this.fetchedTracks = 0;
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
			this.isJoinPlaylistsInProgress = true;
			this.joinedPlaylistName = this.playlist1.name + " + " + this.playlist2.name;
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
			this.isJoinPlaylistsInProgress = false;
		},
		fetchTracks: function(playlistId, playlistN){
			this['isFetchPlaylist' + playlistN + 'InProgress'] = true;
			this.isFetchPlaylistsInProgress = true;
			url = config.apiUrl + "/playlists/" + playlistId;
			this.$http.get(url).then(response => {
				this['playlist' + playlistN] = response.body;
				this.totalTracks += response.body.tracks.total;
				if(response.body.tracks.next !== null){
					this.fetchReminaingTracks(response.body.tracks.next, playlistN);
				}else{
					this['isFetchPlaylist' + playlistN + 'InProgress'] = false;
					this.isFetchPlaylistsInProgress = this.isFetchPlaylist1InProgress || this.isFetchPlaylist2InProgress;
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
				this.fetchedTracks += 100;
				if(response.body.next !== null){
					this.fetchReminaingTracks(response.body.next, playlistN);
				}else{
					this['isFetchPlaylist' + playlistN + 'InProgress'] = false;
					this.isFetchPlaylistsInProgress = this.isFetchPlaylist1InProgress ||this.isFetchPlaylist2InProgress;
				}
			}, response => {
				console.error("There was an error while fetching " + url);
				this.playlistFetchErrors += "\nSomething went wrong while trying to fetch remaining tracks.";
			});
		},
		openPlaylist1: function(){
			window.open(this.playlist1Url, '_blank');
		},
		openPlaylist2: function(){
			window.open(this.playlist2Url, '_blank');
		},
		createPlaylist: function(){
			var url = config.apiUrl + "/me";
			this.$http.get(url).then(response => {
				this.user = response.body;
				url = config.apiUrl + "/users/" + this.user.id + "/playlists";
				var body = {
					name: this.joinedPlaylistName,
					description: "Joined playlist created by Spotify Joiner Playlist App."
				};
				this.$http.post(url, body).then(response => {
					this.joinedPlaylistId = response.body.id;
					url += "/" + response.body.id + "/tracks";
					this.joinedPlaylistExternalUrl = response.body.external_urls.spotify;
					var uriList = [];
					for(let i = 0; i < this.joinedPlaylist.length; i++){
						uriList.push(this.joinedPlaylist[i].uri);
						if((i+1) % 100 === 0){
							this.addTracksToJoinedPlaylist(url, uriList);
							uriList = [];
						}
					}
					if(uriList.length > 0){
						this.addTracksToJoinedPlaylist(url, uriList);
					}
				}, response => {
					console.error("There was an error while posting " + url);
					this.joinedPlaylistErrors += "\nSomething went wrong while trying to create playlist.";
				});
			}, response => {
				console.error("There was an error while fetching " + url);
				this.joinedPlaylistErrors += "\nSomething went wrong while trying to fetch user details (create playlist).";
			});
		},
		addTracksToJoinedPlaylist: function(url, uriList){
			console.log("Adding tracks...");
			console.log(uriList);
			var body = {
				uris: uriList
			};
			this.$http.post(url, body).then(response => {
				console.log("Track added.");
				console.log(response.body);
				if(uriList.length < 100){
					window.open(this.joinedPlaylistExternalUrl, "_blank"); 
				}
			}, response => {
				console.error("There was an error while fetching " + url);
				this.joinedPlaylistErrors += "\nSomething went wrong while trying to add songs to new playlist (create playlist).";
			});
		}
	}
});

Vue.http.interceptors.push(function(request) {
	request.headers.set('Authorization', config.tokenType + " " + config.accessToken);
});