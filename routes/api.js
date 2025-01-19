'use strict';
const { connect } = require('mongoose');
const {connectDB} = require('../database.js');

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async (req, res)=>{
      try{
      let { stock, like } = req.query; // Get query parameters
      let ip = req.ip; // Get user IP address
      
      if(stock){

        if (Array.isArray(stock)) {
          stock = stock.map((ele) => ele.toLowerCase()); // Reassign to stock
          const { stock: stock1, price: price1, likes: likes1 } = await connectDB(stock[0], ip, like);
          const { stock: stock2, price: price2, likes: likes2 } = await connectDB(stock[1], ip, like);
          res.json({
            stockData: [
              {
                stock: stock1,
                price: price1,
                rel_likes: likes1 - likes2,
              },
              {
                stock: stock2,
                price: price2,
                rel_likes: likes2 - likes1,
              },
            ],
          });
        }
        

        else{
          stock = stock.toLowerCase();
          const { stock: stock1, price: price1, likes: likes1 } =  await connectDB(stock, ip, like)
          if(price1){
            res.json({stockData: {stock: stock1, price: price1, likes: likes1}})
          }
          else{
          res.json({ stockData: {likes: likes1}})
          }
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
