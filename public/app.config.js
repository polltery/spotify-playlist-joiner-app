var apiConfig = {
	host: "api.spotify.com",
	version: "v1",
	basePath: "/"
};

var authConfig = {
	host: "accounts.spotify.com",
	basePath: "/authorize",
	params: ["client_id", "redirect_uri", "response_type"]
};

var config = {
	appTitle: "Spotify Playlist Joiner",
	apiUrl: "https://" + apiConfig.host + apiConfig.basePath + apiConfig.version,
	clientId: "14364b72b3dd407aa3e4fdfc7121c680",
	responseType: "token",
	authUrl: "https://" + authConfig.host + authConfig.basePath,
	redirectUri: "http://" + window.location.hostname + ":" + window.location.port + "/",
	accessToken: null,
	tokenType: null,
	expiresIn: null
};