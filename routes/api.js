'use strict';
const { connect } = require('mongoose');
const {connectDB} = require('../database.js');

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async (req, res)=>{
      try{
      const { stock, like } = req.query; // Get query parameters
      const ip = req.ip; // Get user IP address
      stock = stock.toLowerCase();
      if(stock){
      if(Array.isArray(stock)){
        const { stock: stock1, price: price1, likes: likes1 } = await connectDB(stock[0], ip, like)
        const { stock: stock2, price: price2, likes: likes2 } = await connectDB(stock[1], ip, like)
        res.json({ stockData: [{
          stock: stock1, price: price1, likes: likes1-likes2
        },
        {
          stock: stock2, price: price2, likes: likes2-likes1
        }
        ]}) 

      }

      else{
      res.json({ stockData: await connectDB(stock, ip, like)})
      }
    }
     

      }
      catch(err){
        console.log(err)
        res.json(err)
      }
      //res.json()
    });
    
};
