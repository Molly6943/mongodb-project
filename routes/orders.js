const express = require('express');
const { getDB } = require('../utils/mongoUtil');
const { ObjectId } = require('mongodb');
const { authenticateToken } = require('../utils/middlewares');

const COLLECTION = 'orders'
const router = express.Router();

router.get("/", authenticateToken, async function (req, res) {
  // We want to retrieve the documents from the collections
  // and convert it to an array of JSON objects

  const orders = await getDB().collection(COLLECTION)
    .find().toArray();

  res.json({
    orders
  })
});

router.post("/", authenticateToken, async function (req, res) {
  // anything retrieved is from req.body is a string, not number
  // status
  // 0: Pending 1: In Progress 2:Delivered 3: Canceled
  let {restaurantId, createDate = new Date(), updateDate=new Date(), totalAmount, status="0" } = req.body

  if (!totalAmount) {
    res.status(400);
    res.json({
      "error": "Please enter orderDate, totalAmount, status"
    })
    return; // end the function
  }
  restaurantId = new ObjectId(restaurantId)
  const results = await getDB().collection(COLLECTION).insertOne({
    restaurantId, createDate, updateDate, totalAmount, status
  })

  res.json({
    "message": "Added successfully",
    "results": results
  })
});


router.delete("/:id", authenticateToken, async function (req, res) {
  const results = await getDB().collection(COLLECTION).deleteOne({
    '_id': new ObjectId(req.params.id)
  })
  res.json({
    results
  });
})


router.put("/:id", authenticateToken, async function (req, res) {
  // status
  // 0: Pending 1: In Progress 2:Delivered 3: Canceled
  const {updateDate = new Date(), totalAmount, status="0" } = req.body

  if (!totalAmount || !status) {
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
      updateDate, totalAmount, status
    }
  });

  res.json(results);
})

router.post("/:orderId/item", authenticateToken, async function (req, res) {
  const orderId = req.params.orderId;
  let { name, description="", price, category, status=0 } = req.body;
  price = Number(price)
  if (!name || !category) {
    res.status(400);
    res.json({
      "error": "Please enter name, price, category"
    })
    return; // end the function
  }

  if (!price || price <= 0) {
    res.status(400);
    res.json({
      "error": "Price must greater than 0!"
    })
    return; // end the function
  }

  const response = await getDB().collection(COLLECTION)
    .updateOne({
      "_id": new ObjectId(orderId)
    }, {
      "$push": {
        "items": {
          '_id': new ObjectId(),
          name, description, price, category, status
        }
      }
    })
  res.json({
    results: response
  })
})

router.delete("/:orderId/item/:itemId", authenticateToken, async function (req, res) {
  const { orderId, itemId } = req.params;
  const results = await getDB().collection(COLLECTION).updateOne({
    "_id": new ObjectId(orderId)
  }, {
    '$pull': {
      "items": {
        "_id": new ObjectId(itemId)
      }
    }
  })
  res.json({
    results
  })
})

router.put('/:orderId/item/:itemId', authenticateToken, async function (req, res) {
  const { orderId, itemId } = req.params;
  const { name, description, price, category } = req.body;
  const results = await getDB().collection(COLLECTION)
      .updateOne({
          '_id': new ObjectId(orderId),
          'menus._id': new ObjectId(itemId)
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
