document.title=config.appTitle;var app=new Vue({el:"#app",data:{appTitle:config.appTitle,playlist1Url:"https://open.spotify.com/playlist/3mrM0ZsJ9o5qFYJT6IdpoH?si=IXP89EyfScK-1ix8fRnf7A",playlist2Url:"https://open.spotify.com/playlist/6ff5TfwljOgOP3hZIBofqw?si=SeCzKAafTOyJ2YREjeDG5Q",playlistFetchErrors:"",playlist1:{},playlist2:{},joinedPlaylist:[],joinedPlaylistErrors:"",showSongsFromPlaylist:!1,reAuthRequired:!1,isJoinPlaylistsInProgress:!1,isFetchPlaylist1InProgress:!1,isFetchPlaylist2InProgress:!1,isFetchPlaylistsInProgress:!1,fetchedTracks:0,totalTracks:0,user:{},joinedPlaylistId:"",joinedPlaylistExternalUrl:"",joinedPlaylistName:""},methods:{doAuth:function(){window.location.href=config.authUrl+"?client_id="+config.clientId+"&redirect_uri="+config.redirectUri+"&response_type="+config.responseType+"&scope="+config.scope},isAuthCompleted:function(){var t=this.getHashParams();return void 0!==t.access_token&&(config.accessToken=t.access_token,config.tokenType=t.token_type,config.expiresIn=t.expires_in,!0)},fetchPlaylists:function(){if(this.playlistFetchErrors="",this.playlist1={},this.playlist2={},this.joinedPlaylist=[],this.totalTracks=0,this.fetchedTracks=0,""!==this.playlist1Url&&""!==this.playlist2Url){var t=[],s=[];try{t=this.playlist1Url.match(/https\:\/\/.*spotify\.com.*playlist\/(.*?)(\?|$|\/)/),s=this.playlist2Url.match(/https\:\/\/.*spotify\.com.*playlist\/(.*?)(\?|$|\/)/),null!==t[1]&&null!==s[1]?(this.fetchTracks(t[1],"1"),this.fetchTracks(s[1],"2")):this.playlistFetchErrors="Invalid URL."}catch(t){this.playlistFetchErrors="Invalid URL."}}else this.playlistFetchErrors="Both URLs are mandatory."},getHashParams:function(){for(var t,s={},i=/([^&;=]+)=?([^&;]*)/g,e=window.location.hash.substring(1);t=i.exec(e);)s[t[1]]=decodeURIComponent(t[2]);return s},joinPlaylists:function(){if(this.joinedPlaylistErrors="",this.joinedPlaylist=[],this.isJoinPlaylistsInProgress=!0,this.joinedPlaylistName=this.playlist1.name+" + "+this.playlist2.name,void 0!==this.playlist1.tracks&&void 0!==this.playlist2.tracks){var t=this.playlist1.tracks.items,s=this.playlist2.tracks.items;for(let i=0;i<t.length;i++)for(let e=0;e<s.length;e++)t[i].track.id===s[e].track.id&&this.joinedPlaylist.push(t[i].track);this.joinedPlaylist.length<1&&(this.joinedPlaylistErrors="No common tracks were found between the two playlists.")}else this.joinedPlaylistErrors="One of the playlist is missing tracks.";this.isJoinPlaylistsInProgress=!1},fetchTracks:function(t,s){this["isFetchPlaylist"+s+"InProgress"]=!0,this.isFetchPlaylistsInProgress=!0,url=config.apiUrl+"/playlists/"+t,this.$http.get(url).then(t=>{this["playlist"+s]=t.body,this.totalTracks+=t.body.tracks.total,null!==t.body.tracks.next?this.fetchReminaingTracks(t.body.tracks.next,s):(this["isFetchPlaylist"+s+"InProgress"]=!1,this.isFetchPlaylistsInProgress=this.isFetchPlaylist1InProgress||this.isFetchPlaylist2InProgress)},t=>{401===t.status?this.reAuthRequired=!0:this.playlistFetchErrors+="\nPlaylist "+s+": Unable to fetch playlist data.",console.error("There was an error while fetching "+url)})},fetchReminaingTracks:function(t,s){this.$http.get(t).then(t=>{this["playlist"+s].tracks.items=this["playlist"+s].tracks.items.concat(t.body.items),this.fetchedTracks+=100,null!==t.body.next?this.fetchReminaingTracks(t.body.next,s):(this["isFetchPlaylist"+s+"InProgress"]=!1,this.isFetchPlaylistsInProgress=this.isFetchPlaylist1InProgress||this.isFetchPlaylist2InProgress)},t=>{console.error("There was an error while fetching "+url),this.playlistFetchErrors+="\nSomething went wrong while trying to fetch remaining tracks."})},openPlaylist1:function(){window.open(this.playlist1Url,"_blank")},openPlaylist2:function(){window.open(this.playlist2Url,"_blank")},createPlaylist:function(){var t=config.apiUrl+"/me";this.$http.get(t).then(s=>{this.user=s.body,t=config.apiUrl+"/users/"+this.user.id+"/playlists";var i={name:this.joinedPlaylistName,description:"Joined playlist created by Spotify Joiner Playlist App."};this.$http.post(t,i).then(s=>{this.joinedPlaylistId=s.body.id,t+="/"+s.body.id+"/tracks",this.joinedPlaylistExternalUrl=s.body.external_urls.spotify;var i=[];for(let s=0;s<this.joinedPlaylist.length;s++)i.push(this.joinedPlaylist[s].uri),(s+1)%100==0&&(this.addTracksToJoinedPlaylist(t,i),i=[]);i.length>0&&this.addTracksToJoinedPlaylist(t,i)},s=>{console.error("There was an error while posting "+t),this.joinedPlaylistErrors+="\nSomething went wrong while trying to create playlist."})},s=>{console.error("There was an error while fetching "+t),this.joinedPlaylistErrors+="\nSomething went wrong while trying to fetch user details (create playlist)."})},addTracksToJoinedPlaylist:function(t,s){console.log("Adding tracks..."),console.log(s);var i={uris:s};this.$http.post(t,i).then(t=>{console.log("Track added."),console.log(t.body),s.length<100&&window.open(this.joinedPlaylistExternalUrl,"_blank")},s=>{console.error("There was an error while fetching "+t),this.joinedPlaylistErrors+="\nSomething went wrong while trying to add songs to new playlist (create playlist)."})}}});Vue.http.interceptors.push((function(t){t.headers.set("Authorization",config.tokenType+" "+config.accessToken)}));
