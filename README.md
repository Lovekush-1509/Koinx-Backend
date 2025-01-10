```Cryptocurrency Tracker```

1.A server-side application built with Node.js and MongoDB to track cryptocurrency statistics using the CoinGecko API.
2.This application includes background jobs for periodic updates, APIs for fetching the latest statistics, and calculating standard deviations of historical prices.
3.Features Fetches current price, market cap, and 24-hour change for Bitcoin, Matic, and Ethereum.
4.Stores data in MongoDB using a background job that runs periodically.


```Provides APIs to:```
1.Get the latest stats of a cryptocurrency.
2.Calculate the standard deviation of the last 100 price records.

```Prerequisites```
Node.js (v12 or above)
MongoDB (local or MongoDB Atlas)
Internet access to fetch data from the CoinGecko API
