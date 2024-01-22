const express = require('express');
const { getDB } = require('../utils/mongoUtil');
const { ObjectId } = require('mongodb');

const COLLECTION = 'restaurants'
const router = express.Router();

router.get("/", async function (req, res) {
  // We want to retrieve the documents from the collections
  // and convert it to an array of JSON objects

  const restaurants = await getDB().collection(COLLECTION)
    .find().toArray();

  res.json({
    restaurants
  })
});

router.post("/", async function (req, res) {
  // anything retrieved is from req.body is a string, not number
  const { name, description, location, contact } = req.body

  if (!name || !location || !contact) {
    res.status(400);
    res.json({
      "error": "Please enter name, location, contact"
    })
    return; // end the function
  }

  const results = await getDB().collection(COLLECTION).insertOne({
    name, description, location, contact
  })

  res.json({
    "message": "Added successfully",
    "results": results
  })
});


router.delete("/:id", async function (req, res) {
  const results = await getDB().collection(COLLECTION).deleteOne({
    '_id': new ObjectId(req.params.id)
  })
  res.json({
    results
  });
})


router.put("/:id", async function (req, res) {
  // anything retrieved is from req.body is a string, not number
  const { name, description, location, contact } = req.body

  if (!name || !location || !contact) {
    res.status(400);
    res.json({
      "error": "Please enter name, location, contact"
    })
    return; // end the function
  }

  const results = await getDB().collection(COLLECTION).updateOne({
    "_id": new ObjectId(req.params.id)
  }, {
    "$set": {
      name, description, location, contact
    }
  });

  res.json(results);
})

router.post("/restaurant/:restaurantId/menu", async function (req, res) {
  const restaurantId = req.params.restaurantId;
  const { name, description="", price, category, status=0 } = req.body;
  if (!name || !price || !category) {
    res.status(400);
    res.json({
      "error": "Please enter name, price, category"
    })
    return; // end the function
  }
  const response = await getDB().collection(COLLECTION)
    .updateOne({
      "_id": new ObjectId(restaurantId)
    }, {
      "$push": {
        "menus": {
          '_id': new ObjectId(),
          name, description, price, category, status
        }
      }
    })
  res.json({
    results: response
  })
})

router.delete("/restaurant/:restaurantId/menu/:menuId", async function (req, res) {
  const { restaurantId, menuId } = req.params;
  const results = await getDB().collection(COLLECTION).updateOne({
    "_id": new ObjectId(restaurantId)
  }, {
    '$pull': {
      "menus": {
        "_id": new ObjectId(menuId)
      }
    }
  })
  res.json({
    results
  })
})

router.put('/restaurant/:restaurantId/menu/:menuId', async function (req, res) {

  const { restaurantId, menuId } = req.params;
  const { name, description, price, category } = req.body;
  const results = await getDB().collection(COLLECTION)
      .updateOne({
          '_id': new ObjectId(restaurantId),
          'menus._id': new ObjectId(menuId)
      }, {
          '$set': {
              'menus.$.name': name,
              'menus.$.description': description,
              'menus.$.price': price,
              'menus.$.category': category,
          }
      })

  res.json({
      results
  })
});

module.exports = router;
