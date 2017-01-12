const requestManager = require('../src/request-manager');

test('Login Request with invalid credentials fails', () => {
	let credentials = {username: 'user', password: 'password'};

	requestManager.loginUser(credentials).then(result => {
		expect(result.errors).toBeTruthy();
		expect(result.errors[0].field).toBe('login.password');
		expect(result.errors[0].reason).toBe('noMatch');
		expect(result.ok).toBe(false);
	});
});

test('Login Request with valid credentials is ok', () => {
	let credentials = {username: 'camptest2017', password: 'Test@123'};

	requestManager.loginUser(credentials).then(result => {
		expect(result.next_url).toBe('https://bandcamp.com/camptest2017');
		expect(result.ok).toBe(true);
	});
});

test('Opening pages from bandcamp works', () => {
	requestManager.getUrl('https://bandcamp.com/camptest2017').then(result => {
		expect(result).toBeTruthy();
	})
});
