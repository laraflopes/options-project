import express from 'express';
import cors from "cors";
import { config } from 'dotenv';
import { fetchData } from './utils.js';
import { insertData, insertRequestLog, checkRequestExists, queryData } from './database.js';
import { structureDataForFrontend } from './utils.js';

// Initialize the Express application
const app = express();
const PORT = 5000;

config(); // Load environment variables

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json()); // Middleware for parsing JSON

app.get('/fetch/:underlying_ticker', async (req, res) => {
    const underlyingTicker = req.params.underlying_ticker;

    try {
        const today = new Date();
        const dataExists = await checkRequestExists(underlyingTicker, today);

        if (dataExists) {
            const dataFromDB = await queryData(underlyingTicker);
            console.log("Data fetched from DB:", dataFromDB);  // Add this line

            const structuredData = structureDataForFrontend(dataFromDB);
            return res.status(200).json(structuredData);
        }

        let allData = [];
        const pageData = await fetchData(underlyingTicker);
        allData = [...allData, ...pageData];
        await insertData(pageData);
        await insertRequestLog(underlyingTicker);

        const structuredData = structureDataForFrontend(allData);
        res.status(200).json(structuredData);
    } catch (error) {
        console.error("Error in /fetch/:underlying_ticker route:", error.message);  // Add this line
        res.status(500).json({ error: "Failed to fetch data", details: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
