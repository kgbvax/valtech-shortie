﻿var log = require('winston');

function handleError(err, req, res, next) {
    log.error(err);
    if (req.accepts('html')) {
        res.status(500).render('500');
    } else {
        res.send(500, { error: 'internal server error' });
    }
}
exports.handleError = handleError;
