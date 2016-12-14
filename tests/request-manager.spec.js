'use strict';

const test = require('tape');
const requestManager = require('../src/request-manager');

test('Calling login function doesn\'t throw exception', t => {
	t.doesNotThrow(() => {
		let credentials = {username: 'user', password: 'password'};

		requestManager.loginUser(credentials);
	}, true);

	t.end();
});

test('Login Request with invalid credentials fails', t => {
	let credentials = {username: 'user', password: 'password'};

	requestManager.loginUser(credentials).then(result => {
		t.ok(result.errors, 'Error object exists');
		t.equal(result.errors[0].field, 'login.password');
		t.equal(result.errors[0].reason, 'noMatch');

		t.notOk(result.ok, 'Login wasnt successful');
		t.end();
	}).catch(err => {
		t.fail(err);
		t.end();
	});
});

test('Login Request with valid credentials is ok', t => {
	let credentials = {username: 'camptest2017', password: 'Test@123'};

	requestManager.loginUser(credentials).then(result => {
		t.equal(result.next_url, 'https://bandcamp.com/camptest2017');
		t.ok(result.ok, 'Login was successful');
		t.end();
	}).catch(err => {
		t.fail(err);
		t.end();
	});
});

test('Opening pages from bandcamp works', t => {
	requestManager.getUrl('https://bandcamp.com/camptest2017').then(result => {
		t.ok(result);
		t.end();
	}).catch(err => {
		t.fail(err);
		t.end();
	});
});
