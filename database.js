require('dotenv').config();
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

let client;
let db;

async function initDB() {
  if (!client) {
      client = new MongoClient(process.env.CONNECT);
      await client.connect();
      db = client.db("stock-project");
      console.log("Connected to MongoDB");
  }
  return db;
}

const connectDB = async (stock, address, like = false) => {
  try {
    const db = await initDB();
    const stockCollection = db.collection("stocks");
    const userCollection = db.collection("users");

    let likes;

    // 🔹 Fetch all stored hashes from the database
    if(like==='true'){
    const storedHashes = await userCollection.find({}).toArray();

    // 🔹 Check if the address matches any existing hash
    let addressExists = false;
    for (const user of storedHashes) {
      if (await bcrypt.compare(address, user.hash)) {
        addressExists = true;
        break;
      }
    }

    // 🔹 If no existing hash matches, create a new hash and store it

    if (!addressExists) {
      const hash = await bcrypt.hash(address, 2);
      await userCollection.insertOne({ hash });
      console.log("Stored new hashed address:", hash);
    } else {
      console.log("Address already exists, skipping insertion.");
      like = false;  // Ensure 'like' is handled properly
    }
}

    // 🔹 Check if stock exists
    let stockDoc = await stockCollection.findOne({ stock });

    if (!stockDoc) {
      await stockCollection.insertOne({ stock, likes: 0 });
      console.log(`Inserted stock: ${stock}`);
      stockDoc = await stockCollection.findOne({ stock });
    }

    // 🔹 Update likes if needed
    if (like === 'true') {
      const updatedStock = await stockCollection.findOneAndUpdate(
        { stock },
        { $inc: { likes: 1 } },
        { returnDocument: "after" }
      );
      likes = updatedStock.likes;
    } else {
      likes = stockDoc.likes; // Keep the existing like count
    }

    // 🔹 Fetch stock price from external API
    const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
    const priceData = await response.json();

    return { stock, price: priceData.latestPrice, likes };

  } catch (err) {
    console.error("Error retrieving stock data:", err);
  } 
};


module.exports={connectDB};