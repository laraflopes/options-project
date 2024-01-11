import { config } from 'dotenv';
import createPolygonClient from '@polygon.io/client-js';
import fetch from 'node-fetch';
import { format } from 'date-fns';

// Load the environment variables
config();

const apiKey = process.env.POLYGON_API_KEY;
const polygonClient = createPolygonClient(apiKey);

export const fetchData = async (underlying_ticker) => {
    try {
        // Start date: today + 1 week
        let startDate = new Date();
        startDate.setDate(startDate.getDate() + 7);
        
        // End date: today + 3 months
        let endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);
        endDate.setDate(endDate.getDate() - 1);

        const formattedStartDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        const formattedEndDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    
        let allResults = [];
        let nextURL;

        const options = {
            underlying_ticker,
            "expiration_date.gte": formattedStartDate,
            "expiration_date.lte": formattedEndDate,
            limit: 1000
        };

        do {
            let response;
            try {
                //console.log(`Making request at ${new Date().toISOString()} to URL: ${nextURL || 'initial request'}`);
                response = nextURL ? await fetch(nextURL + '&apiKey=' + process.env.POLYGON_API_KEY).then(res => res.json()) : await polygonClient.rest.reference.optionsContracts(options);
                if (response && response.status === 'ERROR') {
                    console.error("API responded with an error:", response);
                    throw Error("API Error");
                }
            } catch (e) {
                if (e.status === 'ERROR') {
                    throw Error("Unknown Error");
                }
                if (!response || !response.results || response.results.length === 0) {
                    throw Error("Error: empty response");
                }
                throw(e);
            }
        
            console.log(`Fetched ${response.results.length} results.`);
        
            allResults.push(...response.results);      
        
            nextURL = response.next_url;

            if(nextURL){
                await new Promise(resolve => setTimeout(resolve, 12000));
            }

        } while (!!nextURL);

        // ~ added code ~

        // allResults.sort((a, b) => {
        //     if (a.expiration_date < b.expiration_date) return -1;
        //     if (a.expiration_date > b.expiration_date) return 1;
        //     if (a.contract_type < b.contract_type) return -1;
        //     if (a.contract_type > b.contract_type) return 1;
        //     return a.strike_price - b.strike_price;
        // });

        //~~
        
        return allResults.map(item => ({
            ticker: item.ticker,
            underlying_ticker: item.underlying_ticker,
            strike_price: item.strike_price,
            expiration_date: item.expiration_date,
            contract_type: item.contract_type
        }));
        
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

// ~new function added on 29/10 to structure sorted data ~
export const structureDataForFrontend = (data) => {
    const structuredData = data.reduce((acc, item) => {
        // Format the expiration date
        const formattedDate = format(new Date(item.expiration_date), 'MMMM d, yyyy');

        if (!acc[formattedDate]) {
            acc[formattedDate] = {
                calls: [],
                puts: []
            };
        }
        acc[formattedDate][item.contract_type === "call" ? "calls" : "puts"].push(item);
        return acc;
    }, {});
    return structuredData;
};
//^.^

