const axiosBase = require('axios')
const moment = require('moment')

const axios = axiosBase.create({
  baseURL: 'https://sinoalice.game-db.tw/package/alice_event2.js',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  responseType: 'json'
});

axios.get()
  .then((res) => {
    const data = res.data.Rows.map(event => {
      event = event.split('|')
      return ({
        StartTime: event[0],
        Icon: event[1],
        EndTime: event[2],
        Bundle: event[3],
        ID: event[4]
      })
    })
    console.log(moment().unix())
    console.log(data.filter(event => event.StartTime >= moment().unix()))
  })
  .catch((err) => {
  console.log(err)
})
