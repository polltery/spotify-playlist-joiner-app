var apiConfig = {
	host: "api.spotify.com",
	version: "/v1"
};

var authConfig = {
	host: "accounts.spotify.com",
	basePath: "/authorize"
};

var config = {
	appTitle: "Spotify Playlist Joiner",
	apiUrl: "https://" + apiConfig.host + apiConfig.version,
	clientId: "14364b72b3dd407aa3e4fdfc7121c680",
	responseType: "token",
	authUrl: "https://" + authConfig.host + authConfig.basePath,
	redirectUri: "#[REDIRECT_URL]",
	accessToken: null,
	tokenType: null,
	expiresIn: null,
	scope: "playlist-modify-public"
};