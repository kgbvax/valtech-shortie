﻿/// <reference path="../../.types/mocha/mocha.d.ts" />
/// <reference path="../../.types/underscore/underscore.d.ts" />

import _ = require('underscore');
import DbFactory = require('../../src/lib/DbFactory');
import data = require('../../src/shorties/data');
var assert = require('chai').assert;

describe('ShortieRepository', function() {
  var repo: data.ShortieRepository, db;
  beforeEach(function(done) {
    DbFactory.create('nedb', {}, function(err, db_) {
      db = db_;
      repo = new data.ShortieRepository(db_, { pageSize: 1 });
      done();
    });
  });

  describe('addShortie()', function () {
    it('should add a new Shortie', function (done) {
      var shortie = {
        url: 'http://icanhazcheezburger.com/',
        slug: 'cats'
      };
      repo.addShortie(shortie);
      db.findOne({ slug: 'cats' }, function (err, doc) {
        assert.isNull(err, err);
        assert.isNotNull(doc);
        assert.equal(doc.slug, 'cats');
        done();
      });
    });
    it('should fail when adding a duplicate Shortie', function (done) {
      var shortie = {
        url: 'http://icanhazcheezburger.com/',
        slug: 'cats'
      };
      repo.addShortie(shortie);
      repo.addShortie(shortie, function (err, doc) {
        assert.isNotNull(err, err);
        done();
      });
    });
  });

  describe('getShortieBySlug()', function () {
    beforeEach(function (done) {
      db.insert({ url: 'http://icanhazcheezburger.com/', slug: 'cats' }, done);
    });
    it('should return existing Shortie', function (done) {
      repo.getShortieBySlug('cats', function (err, doc) {
        assert.isNull(err);
        assert.isNotNull(doc);
        assert.equal(doc.slug, 'cats');
        assert.equal(doc.url, 'http://icanhazcheezburger.com/');
        done();
      });
    });
    it('should return null for non-existing Shortie', function (done) {
      repo.getShortieBySlug('dogs', function (err, doc) {
        assert.isNull(doc);
        done();
      });
    });
  });

  describe('getShortiesByUrl()', function () {
    beforeEach(function (done) {
      db.insert([
        { url: 'http://icanhazcheezburger.com/', slug: 'cats' },
        { url: 'http://icanhazcheezburger.com/', slug: 'moar_cats' }
      ], done);
    });
    it('should return all matching Shorties', function (done) {
      repo.getShortiesByUrl('http://icanhazcheezburger.com/', function (err, docs) {
        assert.isNull(err);
        assert.isNotNull(docs);
        assert.equal(docs.length, 2);
        docs = _.sortBy(docs, function(doc : any) { return doc.slug; })
        assert.equal(docs[0].slug, 'cats');
        assert.equal(docs[1].slug, 'moar_cats');
        done();
      });
    });
    it('should return empty array if no Shorties found', function (done) {
      repo.getShortiesByUrl('http://ihasahotdog.com/', function (err, docs) {
        assert.isNotNull(docs);
        assert.equal(docs.length, 0);
        done();
      });
    });
  });

  describe("getAllShorties()", ()=> {
    beforeEach((done)=> {
      db.insert([
        { url: 'http://icanhazcheezburger.com/', slug: 'cats' },
        { url: 'http://icanhazcheezburger.com/', slug: 'moar_cats' }
      ], done);
    });

    it('should return all shorties if not invoked with any arguments', (done) => {
      repo.getAllShorties((err, docs)=> {
        assert.isNull(err);
        assert.isNotNull(docs);
        assert.equal(docs.length, 2);
        done();
      });
    });

    it("should return first page if specified", (done) => {
      repo.getAllShorties((err, docs) => {
        assert.isNull(err);
        assert.equal(docs.length, 1);
        assert.equal(docs[0].slug, 'cats');
        done();
      }, { page: 0, sort : {slug : 1} });
    });

    it("should return second page if specified", (done) => {
      repo.getAllShorties((err, docs) => {
        assert.isNull(err);
        assert.equal(docs.length, 1);
        assert.equal(docs[0].slug, 'moar_cats');
        done();
      }, { page: 1, sort: { 'slug': 1 } });
    });
  });
});
