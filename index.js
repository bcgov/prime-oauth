//
// OAUTH POC Application
//
var http = require('http');
var url = require('url');
const querystring = require('querystring');

var port = 7000;
const pageTitle = 'OAUTH Authentication POC';
var createTokenURL = 'http://vs-dapp081:7777/oauth2/rest/authz?response_type=code&client_id=oauthpoc&domain=DefaultDomain&scope=ResServer1.scope1&redirect_uri=http://localhost/home/';
//var validateTokenURL = 'http://vs-dapp081:7777/oauth2/rest/authz?accessToken=';
//const createTokenURL = 'http://postman-echo.com/get?code=1111';
const validateTokenURL = 'http://postman-echo.com/get?accessToken=';

var body;
http.createServer()
	.on('request', (request, response) =>
	{
		let parts = url.parse(request.url);
		let pathname = parts.pathname.replace(/\/$/, "");
		if (pathname == '/home')
		{
			home(request, response);
		}
		else
		{
			titlePage(response)
			response.write('This is just the main page<br>');
			response.end()
		}

	})
	.listen(port, () =>
	{
		console.log("server start at port " + port);
	});

/**
 * Handle /home path
**/
function home(req, res)
{
	// Check if user authenticated (request will contain 'code' parameter)
	var parts = url.parse(req.url);
	parsedQs = querystring.parse(parts.query);
	var code = parsedQs.code;
	if (code == null)
	{
		authenticate(req, res, errorPage);
	}
	else
	{
		validate(req, res, code, homePage, errorPage);
	}
}

/**
 * Authenticate a new user (create token)
 * @param {*} req 
 * @param {*} res 
 */
function authenticate(req, res)
{
	http.get(createTokenURL, (resp) =>
	{
		// Need this or won't work
		resp.on('data', (chunk) => 
		{
			if (chunk);
		});

		// All the data has been received
		resp.on('end', () => 
		{
			let headers = resp.headers;
			let statusCode = resp.statusCode;

			// Redirect client to oauth page
			if (statusCode == 302)
			{
				res.writeHead(302, { Location: headers['location'] });
			}
			else
			{
				errorPage(res, 'OAUTH Redirect not received');
			}
			res.end()
		});
	}).on("error", (err) =>
	{
		console.log("Error: " + err.message);
		errorPage(res, err.message);
	});
}

/**
 * Validate auth code
 * @param {*} req 
 * @param {*} res 
 * @param {*} code 
 * @param {*} validPage	callback function if valid 
 * @param {*} errorPage	callback function if invalid or error 
 */
function validate(req, res, code, validPage, invalidPage)
{
	const url = validateTokenURL + code;
	http.get(url, (resp) =>
	{
		// Need this or won't work
		resp.on('data', (chunk) => 
		{
			if (chunk);
		});

		// All the data has been received
		resp.on('end', () => 
		{
			//console.log(data);
			let headers = resp.headers;
			let statusCode = resp.statusCode;

			// Display home page
			if (statusCode == 200)
			{
				validPage(req, res);
			}
			else
			{
				errorPage(res, 'Unexpected Status ' + statusCode + ' received');
			}
			res.end()
		});
	}).on("error", (err) =>
	{
		console.log("Error: " + err.message);
		errorPage(res, err.message);
	});
}

/**
 * Send Home Page
 * @param {*} req 
 * @param {*} res 
 */
function homePage(req, res)
{
	titlePage(res);
	res.write('You are Authenticated!');
	res.end()
}
/**
 * Send Error Page
 * @param {*} res 
 * @param {*} text 
 */
function errorPage(res, text)
{
	titlePage(res);
	res.write('Error: ' + text);
	res.end()
}

/**
 * Title Page
 * @param {*} res 
 */
function titlePage(res)
{
	res.write('<h2>' + pageTitle + '</h2>');
}

/**
 * Wrap text in a scrolling <div>
**/
function wrap(text)
{
	return ('<div style="width:500px;height:400px; font-family:Courier New;word-wrap:break-word; overflow-y:auto">' + text + '</div>');
}