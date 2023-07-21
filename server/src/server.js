const http = require('node:http')

require('dotenv').config()

const app = require('./app')
const { mongoConnect } = require('./services/mongo')
const { loadPlanetsData } = require('./models/planets.model')
const { loadLaunchesData } = require('./models/launches.model')

const PORT = process.env.PORT || 8000
const SERVER = http.createServer(app)

async function startServer() {
  await mongoConnect()
  await loadPlanetsData()
  await loadLaunchesData()
  SERVER.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

startServer()