const express = require('express');
const { getDB } = require('../utils/mongoUtil');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { authenticateToken } = require('../utils/middlewares');
require('dotenv').config();

// create a new router object
// a router object can have routes
const router = express.Router();

// put in routes here
router.post('/', async function (req, res) {
    const result = await getDB().collection("users").insertOne({
        'email': req.body.email,
        'password': await bcrypt.hash(req.body.password, 12)
    })
    res.json({
        "message": "Success",
        "result": result
    })
})

// the full url will be POST /user/logins
// we expect the body to be an object with two keys
// - email: address of the user
// - password: password of the user
router.post('/login', async function (req, res) {
   
    // find the user by the given req.body.email and the req.body.password
    const user = await getDB().collection("users").findOne({
        'email': req.body.email,
    });

    // first argument of bcyrpt.compare: plaintext
    // second argument of bcrypt.compare: the hashed version
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        // user exists and the password given matches the hashed version
        // create the token with jwt.sign
        // 1st parameter: the data to store in the JWT (we must store some identifying information about the user)
        // 2nd parameter: jwt secret
        // 3rd parameter: the expiry
        const token = jwt.sign({
            "_id": user._id
        }, process.env.JWT_SECRET, {
            // can use `h` for hours `m` for minutes, `d` for days, `y` for years
            'expiresIn': '1h'
        });
        res.json({
            'token': token
        })
    } else {
        res.status(401);
        res.json({
            'error': 'Invalid credentials'
        })
    }
})

router.get('/profile', authenticateToken, async function (req, res) {
    // find the user by their _id
    const user = await getDB().collection("users").findOne({
        '_id': new ObjectId(req.data._id)
    }, {
        projection: {
            password: 0
        }
    })
    res.json({
        'message': 'Success',
        'user': user
    })
})

router.get('/logout', authenticateToken, async function (req, res) {
    try {
      const authHeader = req.headers['authorization']; // get the session cookie from request header
      if (!authHeader) return res.sendStatus(204); // No content
    
      res.setHeader('Clear-Site-Data', '"authorization"');
      res.status(200).json({ message: 'You are logged out!' });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
      });
    }
    res.end();
  })

// make sure to export the router object
// so that other files, like index.js, can use it
module.exports = router;
