const axios = require('axios')
const moment = require('moment')
const firebase = require('./firebase')
const admin = require('firebase-admin')

const collection = 'eventsList'
const imgRoot = 'events-banner'

const main = async () => {
  try {
    console.log("Downloading events list... 1/5")
    let res = await axios
      .create({
        baseURL: 'https://sinoalice.game-db.tw/package/alice_event2.js',
        headers: {
            'Content-Type': 'application/json'
          },
        responseType: 'json'
      })
      .get()
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
    await firebase.putImgToDb(res.map(event => {
      return {
        ...event, 
        url: `https://sinoalice.game-db.tw/images/banner/${event.Bundle}/BannerL${event.Icon}.png`
      };
    }), imgRoot)

    let tobatsu = await axios.create({
        baseURL: 'https://sinoalice.game-db.tw/package/alice_raid2.js',
        headers: {
            'Content-Type': 'application/json'
          },
        responseType: 'json'
      })
      .get()
    tobatsu = await Promise.all(tobatsu.data.Rows.map(event => {
      event = event.split('|')
      col = tobatsu.data.Cols.split('|')
      return ({
        [col[0]]: event[0],
        [col[1]]: event[1],
        [col[2]]: event[2],
        [col[3]]: event[3],
        [col[4]]: event[4],
        [col[5]]: event[5],
        [col[6]]: event[6],
      })
    }))
    tobatsu = await Promise.all(tobatsu.map(event => {
      return {
        ...event,
        AreaID: event.AreaID.split(",").map(count =>
          ("00" + count).slice(-2)
        ),
        BannerResource: event.BannerResource.split(",")
      };
    }))
    await firebase.putImgToDb(
      tobatsu.map(event => {
        return {
          ...event,
          Icon: `char${event.AreaID[0]}`,
          url: `https://sinoalice.game-db.tw/images/char${event.AreaID[0]}.png`,
          Bundle: "characterIcon"
        };
      }),
      'characterIcon'
    );

    res = await Promise.all(res.map(event => {
      const guerrilla = tobatsu.filter((item) => {
        return item.BannerResource.indexOf(`${event.Bundle}/${event.Icon}`) >= 0
      }).length > 0 ? true : false
      return ({
        startDate: new admin.firestore.Timestamp(Number(event.StartTime), 0),
        image: `${imgRoot}/${event.Icon}.png`,
        endDate: new admin.firestore.Timestamp(Number(event.EndTime), 0),
        name: event.Icon,
        guerrilla: guerrilla
      })
    }))

    tobatsu = await Promise.all(
      tobatsu.map(event => {
        return {
          ...event,
          image: event.AreaID.map(id => (`characterIcon/char${id}.png`))
        };
      })
    );

    console.log(tobatsu)
    await firebase.DeleteAllDocuments(collection)
    await firebase.AuthDocumentWrite(res, collection)
    await firebase.DeleteAllDocuments('guerrillaList');
    await firebase.AuthDocumentWrite(tobatsu, 'guerrillaList');

  } catch (err) {
    console.log(err)
  }
}

main()
