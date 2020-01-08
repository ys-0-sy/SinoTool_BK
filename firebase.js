const firebase = require('firebase')
const axios = require('axios')
require('firebase/firestore')
require('firebase/storage')

const firebaseConfig = {
  apiKey: "AIzaSyCaBK5yrFrfEHV6SzSnLHF5gYSvv9UaZ4w",
  authDomain: "sinotool-3973b.firebaseapp.com",
  databaseURL: "https://sinotool-3973b.firebaseio.com",
  projectId: "sinotool-3973b",
  storageBucket: "sinotool-3973b.appspot.com",
  messagingSenderId: "520865910956",
  appId: "1:520865910956:web:004ed1a141a3b273124f09",
  measurementId: "G-XNNMMNP599"
};

firebase.initializeApp(firebaseConfig)

const email = process.env.firebaseUserID
const password = process.env.firebasePassword
const BaseImageUrl = "https://sinoalice.game-db.tw/images/banner"

exports.AuthDocumentWrite = data => {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(payload => {
      console.log(payload.user.uid);
    })
    .then(payload => {
      if (data.length === 1) {
        return firebase
          .firestore()
          .collection("users")
          .add(data)
          .then(docRef => {
            console.log("Object")
            console.log("Document written with ID: ", docRef.id);
          })
          .catch(err => {
            console.error("Error adding document: ", err);
          });
      } else {
         new Promise(() => {
           data.map(singleData => {
            firebase
              .firestore()
              .collection("testEvent")
              .add(singleData)
              .then(docRef => {
                console.log("Document written with ID: ", docRef.id);
              })
              .catch(err => {
                console.error("Error adding document: ", err);
              })
           })
        })
      }

    })
    .then(payload => {
      firebase
        .auth()
        .signOut()
        .then(function() {
          console.log("firebase SignOut");
        })
        .catch(function(error) {
          console.error("Signout Error: ", error);
        });
    })
    .catch(function(error) {
      console.error("firebase auth error: ", error);
    });
}

exports.putImgToDb = (data) => {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(payload => {
      console.log(payload.user.uid);
    })
    .then(payload => {
      const allLength = data.length
      return new Promise(() => {
        data.map((event, index) => {
          axios.get(`${BaseImageUrl}/${event.Icon}/BannerL${event.ID}.png`, { responseType: 'arraybuffer' })
            .then(res => {
              console.log(res.data)
              firebase
                .storage()
                .ref()
                .child(`testImages/${event.Icon}.png`)
                .put(res.data)
                .then(function (snapshot) {
                  console.log(`Uploaded ${index + 1} / ${allLength}`);
                })
                .catch(err => {
                  console.warn(err)
                })
          })
        })
      })

    })
    .then(payload => {
      firebase
        .auth()
        .signOut()
        .then(function() {
          console.log("firebase SignOut");
        })
        .catch(function(error) {
          console.error("Signout Error: ", error);
        });
    })
    .catch(function(error) {
      console.error("firebase auth error: ", error);
    });
}
