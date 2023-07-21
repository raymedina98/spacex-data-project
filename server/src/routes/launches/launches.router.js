const express = require('express')

const {
  httpGetALlLaunches,
  httpAddNewLaunch,
  httpAbortLaunch
} = require('./launches.controller')

const launchesRouter = express.Router()

launchesRouter.get('/', httpGetALlLaunches)
launchesRouter.post('/', httpAddNewLaunch)
launchesRouter.delete('/:id', httpAbortLaunch)

module.exports = launchesRouter