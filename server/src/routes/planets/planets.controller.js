const { getALlPlanets } = require('../../models/planets.model')

async function httpGetALlPlanets(req, res) {
  return res.status(200).json(await getALlPlanets())
}

module.exports = {
  httpGetALlPlanets
}