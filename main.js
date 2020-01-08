const axiosBase = require('axios')
const moment = require('moment')
const firebase = require('./firebase')


const axios = axiosBase.create({
  baseURL: 'https://sinoalice.game-db.tw/package/alice_event2.js',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  responseType: 'json'
});

const data = {
  first: "Ada",
  last: "Lovelace",
  born: 1815
};

axios.get()
  .then((res) => {
    return(res.data.Rows.map(event => {
      event = event.split('|')
      return ({
        StartTime: event[0],
        Icon: event[1],
        EndTime: event[2],
        Bundle: event[3],
        ID: event[4]
      })
    }))
  })
  .then(payload => {
    console.log(payload.length)
    console.log(typeof payload)
    firebase.AuthDocumentWrite(payload);
  })
  .catch((err) => {
  console.log(err)
})
