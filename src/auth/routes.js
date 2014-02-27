/// <reference path="../../types/node/node.d.ts" />
var util = require('util'), request = require('request'), qs = require('querystring');

var VAUTH_CONSUMER_KEY = 'wix6Iz249hFjMsXI7QcfUTKl8oXVH4CfYNSE7cED', VAUTH_CONSUMER_SECRET = 'L76UBmoGjx3Veq8MLi622yAUZMwAMgchikIEJeI2';

var VAUTH_HOST = 'vauth.valtech.se', VAUTH_REQUEST_TOKEN_URL = util.format('https://%s/oauth/request_token', VAUTH_HOST), VAUTH_ACCESS_TOKEN_URL = util.format('https://%s/oauth/access_token', VAUTH_HOST), VAUTH_AUTHORIZE_URL = util.format('https://%s/oauth/authorize', VAUTH_HOST), VAUTH_PROFILE_URL = util.format('https://%s/users/me', VAUTH_HOST), VAUTH_USERS_URL = util.format('https://%s/users/', VAUTH_HOST);

function login(req, res, next) {
    // TODO: Refactor this check into some middleware
    if (req.authSession.signed_in === true) {
        return res.redirect('/me?alreadySignedIn');
    }

    var oauth_body = {
        consumer_key: VAUTH_CONSUMER_KEY,
        consumer_secret: VAUTH_CONSUMER_SECRET,
        callback: abs_url(req, '/login/authenticated')
    };
    request.post({ url: VAUTH_REQUEST_TOKEN_URL, oauth: oauth_body }, function (vauthErr, vauthRes, vauthBody) {
        var err = parse_vauth_err(vauthErr, vauthRes, vauthBody);
        if (err)
            return next(err);

        var request_token = qs.parse(vauthBody);
        req.authSession.token = request_token;
        console.log('sucessfully got a request token', request_token);

        var authorize_url = util.format('%s?oauth_token=%s', VAUTH_AUTHORIZE_URL, request_token.oauth_token);
        res.redirect(authorize_url);
    });
}

function logout(req, res) {
    req.authSession.reset();
    res.redirect('/');
}

function authenticated(req, res, next) {
    var token = req.authSession.token;
    delete req.authSession.token;

    if (req.query.oauth_verifier) {
        token.oauth_verifier = req.query.oauth_verifier;
    }

    var oauth_body = {
        consumer_key: VAUTH_CONSUMER_KEY,
        consumer_secret: VAUTH_CONSUMER_SECRET,
        token: token.oauth_token,
        token_secret: token.oauth_token_secret,
        verifier: token.oauth_verifier
    };
    request.post({ url: VAUTH_ACCESS_TOKEN_URL, oauth: oauth_body }, function (vauthErr, vauthRes, vauthBody) {
        var err = parse_vauth_err(vauthErr, vauthRes, vauthBody);
        if (err)
            return next(err);

        var token = qs.parse(vauthBody);
        console.log('sucessfully got an access token', token);

        load_profile(token, function (err, profile) {
            if (err)
                return next(err);

            req.authSession.profile = profile;
            req.authSession.signed_in = true;
            console.log('got a profile', profile);
            res.redirect('/me');
        });
    });
}

function viewSession(req, res) {
    res.send(200, req.authSession);
}

function abs_url(req, path) {
    return util.format('%s://%s%s', req.protocol, req.get('host'), path);
}

function parse_vauth_err(err, res, body) {
    var status_code = res.statusCode;
    if (err || status_code != 200) {
        return 'invalid response from vauth: ' + status_code + ': ' + body;
    }
}

function load_profile(token, callback) {
    var oauth_body = {
        consumer_key: VAUTH_CONSUMER_KEY,
        consumer_secret: VAUTH_CONSUMER_SECRET,
        token: token.oauth_token,
        token_secret: token.oauth_token_secret
    };
    var headers = {
        'Accept': '*/*'
    };
    request.get({ url: VAUTH_PROFILE_URL, oauth: oauth_body, json: true, headers: headers }, function (vauthErr, vauthRes, vauthBody) {
        var err = parse_vauth_err(vauthErr, vauthRes, vauthBody);
        if (err)
            return callback(err);

        callback(null, vauthBody);
    });
}

function setup(app) {
    app.get('/login', login);
    app.get('/login/authenticated', authenticated);
    app.get('/logout', logout);
    app.get('/me', viewSession);
}
exports.setup = setup;
