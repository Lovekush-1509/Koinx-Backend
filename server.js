require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');
const Crypto = require('./models/Crypto');

const app = express();
app.use(express.json());
const parser = require('body-parser');
app.use(parser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Background Job to Fetch Cryptocurrency Data
const fetchCryptoData = async () => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd',
                ids: 'bitcoin,ethereum,matic-network',
            },
        });

        for (const coin of response.data) {
            await Crypto.create({
                coin: coin.id,
                price: coin.current_price,
                marketCap: coin.market_cap,
                change24h: coin.price_change_percentage_24h,
            });
        }
        console.log('Fetching crypto data at', new Date());
        console.log('Data fetched and stored successfully.');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};


// Schedule the Job to Run Every 2 Hours
cron.schedule('0 */2 * * *', fetchCryptoData);
// for every 5 seconds
// cron.schedule('*/5 * * * * *', fetchCryptoData);


// API to Fetch Latest Data for a Coin
// GET http://localhost:4000/stats?coin=bitcoin
app.get('/stats', async (req, res) => {
    const { coin } = req.query;
    console.log('Request received:', req.query);

    if (!coin) {
        return res.status(400).json({ error: 'Coin query parameter is required.' });
    }

    const latestData = await Crypto.findOne({ coin }).sort({ timestamp: -1 });

    if (!latestData) {
        return res.status(404).json({ error: 'Data not found for the requested coin.' });
    }

    res.json({
        price: latestData.price,
        marketCap: latestData.marketCap,
        '24hChange': latestData.change24h,
    });
});

// below API is to Calculate Standard Deviation of Prices
// GET http://localhost:4000/deviation?coin=bitcoin
app.get('/deviation', async (req, res) => {
    const { coin } = req.query;

    if (!coin) {
        return res.status(400).json({ error: 'Coin query parameter is required.' });
    }

    const records = await Crypto.find({ coin }).sort({ timestamp: -1 }).limit(100);

    if (!records.length) {
        return res.status(404).json({ error: 'Not enough data for the requested coin.' });
    }

    const prices = records.map(record => record.price);
    const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
    const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / prices.length;
    const deviation = Math.sqrt(variance);

    res.json({ deviation: deviation.toFixed(2) });
});

// Start the Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Hello jii, Server is running on port ${PORT}`);
});

app.get('/',(req,res)=>{
    res.send("Hello ji");
})


