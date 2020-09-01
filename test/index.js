const tape = require('tape')
const bent = require('bent')
const getPort = require('get-port')
const nock = require('nock')
const server = require('../')
const getJSON = bent('json')
const getBuffer = bent('buffer')

// Use `nock` to prevent live calls to remote services

let context = {}

tape('setup', async function (t) {
	const port = await getPort()
	context.server = server.listen(port)
	context.origin = `http://localhost:${port}`

	t.end()
})

tape('should get dependencies', async function (t) {
	const html = (await getBuffer(`${context.origin}/dependencies`)).toString()

	t.equal(html.toString().includes('bent'), true, 'should contain bent')
	t.equal(html.toString().includes('express'), true, 'should contain express')
	t.equal(html.toString().includes('hbs'), true, 'should contain hbs')
	t.end()
})

tape('should get minimum secure versions', async function (t) {
	nock('https://nodejs.org/')
		.get('/dist/index.json')
		.reply(200, [{
			"version": "v0.12.17",
			"security": true
		}, {
			"version": "v0.12.16",
			"security": true
		}, {
			"version": "v4.9.1",
			"security": false
		}, {
			"version": "v4.9.0",
			"security": true
		}])

	const response = (await getJSON(`${context.origin}/minimum-secure`))

	t.equal(response.v0.version, 'v0.12.17', 'v0 version should match')
	t.equal(response.v4.version, 'v4.9.0', 'v4 version should match')

})

tape('should get latest-releases', async function (t) {
	nock('https://nodejs.org/')
		.get('/dist/index.json')
		.reply(200, [{
			"version": "v14.9.0",
			"security": true
		}, {
			"version": "v14.4.0",
			"security": true
		}, {
			"version": "v13.14.0",
			"security": false
		}, {
			"version": "v13.11.0",
			"security": true
		}])

	const response = (await getJSON(`${context.origin}/latest-releases`))

	t.equal(response.v14.version, 'v14.9.0', 'v14 version should match')
	t.equal(response.v13.version, 'v13.14.0', 'v13 version should match')

})



// more tests

tape('teardown', function (t) {
	context.server.close()
	t.end()
})