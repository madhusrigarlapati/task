var express = require('express');
var router = express.Router();
const { async } = require("@firebase/util");
const {FieldValue} = require('firebase-admin/firestore');
const https = require("https");

const {db}=require('../firebase.js')

router.get('/',async (req,res)=>{
  
const deleteAllDocuments = async (collectionRef) => {
  const snapshot = await collectionRef.get();
  if (snapshot.size === 0) {
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

const collectionRef = db.collection('data');
await deleteAllDocuments(collectionRef)
  .then(() => {
    console.log('All documents deleted from collection');
  })
  .catch((error) => {
    console.error('Error deleting documents: ', error);
  });
  try{
    const options = "https://api.wazirx.com/api/v2/tickers";
    https.get(options, function(response) {
      let data = '';
      response.on('data', function(chunk) {
        data += chunk;
      });
      response.on('end', async function() {
        const tickers = JSON.parse(data);
        const top10key=Object.keys(tickers).slice(0, 10);
        const top10val = Object.values(tickers).slice(0, 10);
        for(let j=0;j<10;j++){
          const docRef = db.collection('data').doc(top10key[j]);
          docRef.set({
            last: top10val[j].last,
            buy: top10val[j].buy,
            sell: top10val[j].sell,
            volume: top10val[j].volume,
            base_unit: top10val[j].base_unit
          })
          .then(function() {
            console.log('Document successfully added');
          })
          .catch(function(error) {
            console.error('Error', error);
          });
        
      } 
      
      res.render('index',{top10key:top10key,top10val});
    });

    })
  }
  catch(error){
    console.log(error)
  }
});

  

module.exports=router;