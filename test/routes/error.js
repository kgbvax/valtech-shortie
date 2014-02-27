var request = require('supertest'),
    express = require('express'),
    _ = require('underscore');

process.env['env'] = 'test';

var app = require('../../src/app').App;

_.each(['GET', 'POST'], function(verb) {
  describe(verb + ' /non-existing-resource', function() {
    it('should return html for requests that accept html', function(done) {
      request(app)
        [verb.toLowerCase()]('/non-existing-resource')
        .set('Accept', 'text/html')
        .expect('Content-Type', /text\/html/)
        .expect(/not found/)
        .expect(404, done);
    });
    it('should return json for requests that accept json', function(done) {
      request(app)
        [verb.toLowerCase()]('/non-existing-resource')
        .set('Accept', 'appliction/json')
        .expect('Content-Type', /application\/json/)
        .expect({error: 'not found'})
        .expect(404, done);
    });
  });

  // TODO: Test 500 responses as well, but it is more difficult
});