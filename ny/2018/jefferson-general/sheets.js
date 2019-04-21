const sheetNames = [
  'Governor & Lt. Governor',
  'Comptroller',
  'Attorney General',
  'State Supreme Court',
  'U.S. Senate',
  '21st Congressional'
]

const transformGovLtGov = data => {
  const candidatePairs = [
    ['Cuomo/Hochul', 'DEM'],
    ['Molinaro/Killian', 'REP'],
    ['Molinaro/Killian', 'CON'],
    ['Hawkins/Lee', 'GREEN'],
    ['Cuomo/Hochul', 'WF'],
    ['Cuomo/Hochul', 'IND'],
    ['Cuomo/Hochul', 'WEP'],
    ['Molinaro/Killian', 'REF'],
    ['Miner/Volpe', 'SAM'],
    ['Sharpe/Hollister', 'LIB'],
    ['Write-In', '']
  ]

  const resultRows = data.slice(14, 72)

  const rows = []
  
  resultRows.forEach(row => {
    const precinct = row[0]
    candidatePairs.forEach((candidatePair, pIndex) => {
      const candidates = candidatePair[0].split('/')
      const party = candidatePair[1]
      const votes = row[pIndex + 7]
      candidates.forEach((candidate, cIndex) => {
        let office = 'Governor'
        if (cIndex === 1) office = 'Lt. Governor'

        rows.push({
          county: 'Jefferson',
          precinct,
          office,
          district: '',
          party,
          candidate,
          votes
        })
      })
    })
  })
  
  return rows
}

const createTransformSingleCandidate = (office, district, resultRowsIndexes) => {
  const isUSSenate = office === 'U.S. Senate'
  return data => {
    const candidatesStartingIndex = data[0].indexOf('% Turnout') + 1
    const candidatesEndingIndex = data[0].indexOf('Write-ins') + 1
    const totalRegisteredIndex = data[0].indexOf('Voter Registration')
    const totalCastIndex = data[0].indexOf('Total Votes Cast')
    const candidates = data[0]
      .slice(candidatesStartingIndex, candidatesEndingIndex)
      .map((candidate, cIndex) => {
        const party = data[1][candidatesStartingIndex + cIndex] || ''
        return [candidate, party]
      })
    

    const resultRows = data.slice(
      resultRowsIndexes[0],
      resultRowsIndexes[1]
    )

    const rows = []

    resultRows.forEach(row => {
      const precinct = row[0]
      candidates.forEach((c, cIndex) => {
        const candidate = c[0]
        const party = c[1]
        const votes = row[candidatesStartingIndex + 7]

        rows.push({
          county: 'Jefferson',
          precinct,
          office,
          district,
          party,
          candidate,
          votes
        })

        if (isUSSenate) {
          rows.push({
            county: 'Jefferson',
            precinct,
            office: 'Registered Voters',
            district,
            party: '',
            candidate: '',
            votes: row[totalRegisteredIndex]
          })

          rows.push({
            county: 'Jefferson',
            precinct,
            office: 'Ballots Cast',
            district,
            party: '',
            candidate: '',
            votes: row[totalCastIndex]
          })
        }
      })
    })

    return rows
  }
}

// keys are sheet names, values are functions that take the sheet data
// and return a normalized array of objects, ready to be turned into
// a CSV
const transformers = {
  'Governor & Lt. Governor': transformGovLtGov,
  'Comptroller': createTransformSingleCandidate('Comptroller', '', [14, 72]),
  'Attorney General': createTransformSingleCandidate('Attorney General', '', [16, 73]),
  'U.S. Senate': createTransformSingleCandidate('U.S. Senate', '', [15, 73]),
  '21st Congressional': createTransformSingleCandidate('U.S. House', '21', [14, 72]),
  '48th State Senate': createTransformSingleCandidate('State Senate', '48', [14, 72]),
  '116th Assembly District': createTransformSingleCandidate('State Assembly', '116', [14, 41]),
  '117th Assembly District': createTransformSingleCandidate('State Assembly', '117', [14, 30]),
}

module.exports = {
  sheetNames,
  transformers
}