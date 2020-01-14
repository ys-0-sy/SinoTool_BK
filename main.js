const axiosBase = require('axios')
const moment = require('moment')
const firebase = require('./firebase')

const axios = axiosBase.create({
  baseURL: 'https://sinoalice.game-db.tw/package/alice_event2.js',
  headers: {
    'Content-Type': 'application/json'
  },
  responseType: 'json'
});

const collection = 'test-event'
const imgRoot = 'test-events-banner'

const main = async () => {
  try {
    console.log("Downloading events list... 1/5")
    let res = await axios.get()
    console.log("done.")
    res = await Promise.all(res.data.Rows.map(event => {
      event = event.split('|')
      col = res.data.Cols.split('|')
      return ({
        [col[0]]: event[0],
        [col[1]]: event[1],
        [col[2]]: event[2],
        [col[3]]: event[3],
        [col[4]]: event[4]
      })
    }))
    res = await Promise.all(res.filter(event => {
      return event.EndTime >= moment().unix()
    }))
    await firebase.putImgToDb(res, imgRoot)
    res = await Promise.all(res.map(event => {
      return ({
        startDate: event.StartTime,
        image: `${imgRoot}/${event.Icon}.png`,
        endDate: event.EndTime,
        name: event.Icon,
        guerrilla: event.Bundle.match(`.*tobatsu`)
      })
    }))
    await firebase.DeleteAllDocuments(collection)
    await firebase.AuthDocumentWrite(res, collection);
  } catch (err) {
    console.log(err)
  }
}

main()
