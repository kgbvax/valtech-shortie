﻿/// <reference path="../../types/node/node.d.ts" />
/// <reference path="../../types/express/express.d.ts" />
function index(req, res) {
    res.render('index');
}
function admin(req, res) {
    res.render('admin');
}

function setup(app) {
    app.get('/', index);
    app.get('/admin', admin);
}
exports.setup = setup;