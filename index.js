const express = require('express');
const cors = require('cors'); // cross origin resources sharing
const userRoutes = require("./routes/users");
const restaurantsRoutes = require("./routes/restaurants");
const ordersRoutes = require("./routes/orders");

const { connect } = require("./utils/mongoUtil");

require("dotenv").config();

const app = express();

app.use(cors()); // make sure cors() is a function call

// req.body will only be available as JSON if we have the line below  
app.use(express.json());

async function main() {
  await connect(process.env.MONGO_URL, process.env.DB_NAME);
  app.use('/users', userRoutes);
  app.use('/restaurants', restaurantsRoutes);
  app.use('/orders', ordersRoutes);

}
main()

app.listen(3000, function () {
  console.log("Server has started");
})