require('dotenv').config()
var cluster = require('cluster')

if (cluster.isMaster) {
    var cpuCount = require('os').cpus().length

    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork()
    }
    cluster.on('exit', function (worker) {
        // Replace the dead worker,
        // we're not sentimental
        console.log('Worker %d died :(', worker.id)
        cluster.fork()
    })
} else {
    const express = require('express')
    const bodyParser = require('body-parser')
    const isBot = require('isbot-fast')
    const db = require('./src/db.js')
    const app = express()
    app.use(bodyParser.json())
    app.use(express.static('public'))
    app.set('view engine', 'ejs')

    app.get('/', function (req, res) {
        console.log(req.host)
        if (req.host === 'localhost' || req.host === 'img.rudixlab.com') {
            res.end('ok')
        } else {
            res.render('rudix', {})
        }
    })
    app.get('/img', function (req, res) {
        const ua = req.headers['user-agent'] || ''

        if (isBot(ua)) {
            res.end(ua)
        } else {
            res.end('not bot')
            // Making cookies
        }
    })

    db.put(
        {
            id: 'test',
        },
        function (data) {
            console.log(data)
        }
    )

    app.get('/:id', async function (req, res) {
        const data = await db.get(req.params.id)
        res.json(data)
    })
    app.post('/', async function (req, res) {
        const data = await db.put(req.body)
        res.json(data)
    })

    app.listen(process.env.PORT || 3000)
}
