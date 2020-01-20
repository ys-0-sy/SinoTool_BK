const admin = require('firebase-admin')
const axios = require('axios')
const fs = require('fs')

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_API_KEY)),
  databaseURL: "https://sinotool-3973b.firebaseio.com",
  storageBucket: "gs://sinotool-3973b.appspot.com"
});

exports.AuthDocumentWrite = (data, collection) => {
  console.log("Writing Database... 5/5")
  let db = admin.firestore();
  data.map(singleData => {
    try {
      db.collection(collection).add(singleData)
    } catch (err) {
      console.warn(err)
    }
  })
  console.log("done.")
}

exports.DeleteAllDocuments = async collection => {
  const firestore = admin.firestore()
  let collectionRef = firestore.collection(collection);

  try {
    console.log(`firestore Documents Deleting... 4/5 Collection: ${collection}`)
    documentRefs = await collectionRef.listDocuments()
    await Promise.all(documentRefs.map(documentRef => {
        admin.firestore().runTransaction(transaction => {
          transaction.delete(documentRef);
          return Promise.resolve()
        })
      })
    )
    console.log(`Delete All Done.`)
  } catch (err) {
    console.warn(err)
  }
}

exports.putImgToDb = async (data, collection) => {
  const bucket = admin.storage().bucket()
  const targetDirectoryPath = './tmp'
  try {
    console.log("Uploading Image to firebase storage... 2/5")
    if (!fs.existsSync(targetDirectoryPath)) {
      fs.mkdirSync(targetDirectoryPath);
    }
    await Promise.all(data.map(async (event) => {
      const res = await axios.get(
        event.url,
        {
          responseType: 'arraybuffer',
          headers: { contentType: "image/png" }
        })
      fs.writeFileSync(`./${targetDirectoryPath}/${event.Icon}.png`, new Buffer.from(res.data), 'binary');

      const options = {
        destination: `${collection}/${event.Icon}.png`,
        resumable: false,
        validation: 'crc32c',
        metadata: {
          metadata: {
            background: `${event.Bundle}`
          }
        }
      };
      
      await bucket.upload(`./${targetDirectoryPath}/${event.Icon}.png`, options, (err, file) => {
        if (err) {
          throw (err)
        }
      })
    }))
    console.log("upload finished")
    console.log("Templary file deleting... 3/5")
    const targetRemoveFiles = fs.readdirSync(targetDirectoryPath);
    targetRemoveFiles.forEach(file => {
      fs.unlinkSync(`${targetDirectoryPath}/${file}`);
    })
    fs.rmdirSync(targetDirectoryPath);
    console.log("done.")


  } catch (err) {
    console.warn(err)
  }
}
