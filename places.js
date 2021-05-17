const express = require('express');
const app = express();
const axios = require("axios");
const cors = require('cors');

app.use(cors())

app.get('/address/:address/radious/:radious', async function(req, res) {
  const services = [
    "airport",
    "bank",
    "convenience_store",
    "electrician",
    "museum",
    "police",
    "fire_station",
    "plumber",
    "school",
    "pharmacy",
    "gas_station",
    "hospital",
    "restaurant",
  ];

  const baseUrl = 'https://maps.googleapis.com/maps/api/place';
  const key = '';
  const reference = (
    await axios.get(
      `${baseUrl}/findplacefromtext/json?input=${req.params.address}&inputtype=textquery&fields=geometry&key=${key}`
    )
  ).data;
  const geolocation = reference.candidates[0].geometry.location;
  const establishmentsPromises = services.map((service) =>
    axios.get(
      `${baseUrl}/nearbysearch/json?location=${geolocation.lat}, ${geolocation.lng}&radius=${req.params.radious}&type=${service}&fields=geometry,url,website,international_phone_number,formatted_address,name,contact&key=${key}`
    )
  );

  const establishments = await Promise.all(establishmentsPromises);
  const detailPromises = establishments.reduce((prev, crr) => {
    const itemsPromises =
      crr.data &&
      crr.data.results.map((item) =>
        axios.get(
          `${baseUrl}/details/json?place_id=${item.place_id}&key=${key}`
        )
      );

    return prev.concat(itemsPromises);
  }, []);

  const details = await Promise.all(detailPromises);
  const data = details.map((detail) => detail.data && detail.data.result);
   res.send(data);
})

app.listen(3001, () => {
    console.log(`Example app listening at http://localhost:3001`)
  })