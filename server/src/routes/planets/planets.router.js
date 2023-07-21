const express = require('express')

const {
  httpGetALlPlanets,
} = require('./planets.controller')

const planetsRouter = express.Router()

planetsRouter.get('/', httpGetALlPlanets)

module.exports = planetsRouter