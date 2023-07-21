const launches = require('./launches.mongo')
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100
const SPACEX_API_URL = 'https://api.spacexdata.com/v5/launches/query'

async function populateLaunches() {
  console.log('Downloading launch data...')
  const response = await fetch(SPACEX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: {},
      options: {
        pagination: false,
        populate: [
          {
            path: 'rocket',
            select: {
              name: 1
            }
          },
          {
            path: 'payloads',
            select: {
              customers: 1
            },
          }
        ]
      }
    })
  })

  if (response.status !== 200) {
    console.log('Problem downloading launch data')
    throw new Error('Launch data download failed')
  }

  const { docs: launchDocs = [] } = await response.json()

  for (const launchDoc of launchDocs) {
    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers: launchDoc['payloads'].flatMap((payload) => payload['customers'])
    }

    console.log(`${launch.flightNumber} ${launch.mission}`)

    await saveLaunch(launch)
  }
}

async function loadLaunchesData() {
  const firstSpacexLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  })

  if (firstSpacexLaunch) {
    console.log('Launch date already loaded!')
  } else {
    await populateLaunches()
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter)
}

async function existLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId
  })
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches
    .findOne()
    .sort('-flightNumber')

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER
  }

  return latestLaunch.flightNumber
}

async function getALlLaunches(skip, limit) {
  return await launches
    .find({}, {
      '_id': 0,
      '__v': 0
    })
    .sort('flightNumber')
    .skip(skip)
    .limit(limit)
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch, {
    upsert: true
  })
}

async function scheduleNewLaunch(launch) {
  let newFlightNumber = await getLatestFlightNumber()  + 1

  const planet = await planets.findOne({
    keplerName: launch.target
  })

  if (!planet) {
    throw new Error('No matching planet found')
  }

  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    customers: ['Zero to Mastery', 'NASA'],
    upcoming: true,
    success: true
  })

  await saveLaunch(newLaunch)
}

async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne({
    flightNumber: launchId
  }, {
    upcoming: false,
    success: false
  })

  return aborted.modifiedCount === 1
}

module.exports = {
  loadLaunchesData,
  existLaunchWithId,
  getALlLaunches,
  scheduleNewLaunch,
  abortLaunchById
}