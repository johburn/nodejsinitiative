const express = require('express')
const hbs = require('hbs')
const dependencies = require('./package.json')
const bent = require('bent')
const semver = require('semver')


const app = express()

const getJSON = bent('json')

app.set('view engine', 'hbs');

app.get('/dependencies', (req, res) => {
    res.render('dependencies.hbs', dependencies)
})

app.get('/minimum-secure', async (req, res) => {
    let json = await getJSON('https://nodejs.org/dist/index.json')
    //to filter
    const filteredJSON = json.filter(x => x.security)
        .reduce((previous, current) => (
            !previous['v' + semver.major(current.version)] ?
            previous['v' + semver.major(current.version)] = current :
            null, previous
        ), {})
    //to order output
    const ordered = Object.keys(filteredJSON).sort((a, b) => {
        return semver.major(semver.valid(semver.coerce(a))) - semver.major(semver.valid(semver.coerce(b)))
    }).reduce((obj, key) => {
        obj[key] = filteredJSON[key]
        return obj
    }, {})

    res.send(ordered).status(200)
})

app.get('/latest-releases', async (req, res) => {
    let json = await getJSON('https://nodejs.org/dist/index.json')
    //to filter
    const filteredJSON = json.reduce((previous, current) => (
        !previous['v' + semver.major(current.version)] ?
        previous['v' + semver.major(current.version)] = current :
        null, previous
    ), {})

    res.send(filteredJSON).status(200)
})

const PORT = 3000

app.listen(PORT)

module.exports = app