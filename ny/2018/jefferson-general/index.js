const fs = require('fs')

const d3 = require('d3-dsv')
const xlsx = require('node-xlsx').default

const { sheetNames, transformers } = require('./sheets')

const source = 'Public Copy of Jefferson County General Election, 2018.xlsx'
const workSheets = xlsx.parse(source).filter(s => {
  return sheetNames.includes(s.name)
}).map(s => {
  const transformer = transformers[s.name] || (z => z)
  return {
    name: s.name,
    data: transformer(s.data)
  }
}).reduce((accum, next) => {
  console.log(`next length (${next.name}): ${next.data.length}`)
  return accum.concat(next.data)
}, [])

const csv = d3.csvFormat(workSheets, [
  'county',
  'precinct',
  'office',
  'district',
  'party',
  'candidate',
  'votes'
])

fs.writeFileSync('20181106__ny__general__jefferson__precinct.csv', csv)

console.log('done!')
