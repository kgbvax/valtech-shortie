﻿/// <reference path="../../.types/express/express.d.ts" />

import express = require('express');
import slugGenerator = require('../lib/SlugGenerator');

var repo;

function getHandler(req, res, next) {
  repo.getShortieBySlug(req.params.slug, function (err, shortie) {
    if (err || !shortie) return next();
    res.redirect(shortie.url);
  });
}

function listHandler(req, res, next) {
  // TODO: require auth
  if (req.accepts('application/json')) {
    repo.getAllShorties(function (err, shorties) {
      if (err) return next(err);
      res.send(200, shorties);
    });
    return;
  }
  next();
}

function postHandler(req, res, next) {
  // TODO: require auth
  // return 400 on invalid data
  var url = req.body.url;
  if (isInvalidUrl(url)) return res.send(400, 'Invalid URL in request body');
  var slug = slugGenerator.generate();

  var shortie = {
    slug: slug,
    url: url
  };

  repo.addShortie(shortie, function(err) {
    if (err) return next(err);
    res.send(201, shortie);
  });
}

function putHandler(req, res, next) {
  // TODO: require auth
  var url = req.body.url;
  if (isInvalidUrl(url)) return res.send(400, 'Invalid URL in request body');
  var slug = req.params.slug;
  if (isInvalidSlug(slug)) return res.send(400, 'Invalid slug in request body');

  var shortie = {
    slug: slug,
    url: url
  };

  repo.addShortie(shortie, function(err) {
    if (err) return next(err);
    res.send(201, shortie);
  });
}

function deleteHandler(req, res, next) {
  // TODO: require auth
  var slug = req.params.slug;
  if (isInvalidSlug(slug)) return res.send(400, 'Invalid slug in request body');

  repo.removeShortie(slug, function(err, numRemoved) {
    if (err) return next(err);
    if (numRemoved != 1) return res.send(404, 'Shortie not found');
    res.send(200, 'Shortie removed');
  });
}

function isInvalidUrl(url) {
  // TODO: Write better validation
  // TODO: Move somewhere?
  if (!url || url.length === 0) return true;
}

function isInvalidSlug(url) {
  // TODO: Write better validation. Slug cannot clash with routes
  // TODO: Move somewhere
  if (!url || url.length === 0) return true;
}

export function setup(app: express.Application, options: any): void {
  repo = options.shortiesRepo;

  app.get('/', listHandler);
  app.get('/:slug', getHandler);
  app.post('/', postHandler);
  app.put('/:slug', putHandler);
  app.del('/:slug', deleteHandler);
}
