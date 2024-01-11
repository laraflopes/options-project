import mysql from 'mysql2/promise';
import { config } from 'dotenv';

// Load environment variables from .env
config();

// Configuration object for the database using environment variables.
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Function to initialize a connection to the database.
const initializeDatabase = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
};

// Function to insert fetched data into the options_data table.
const insertData = async (data) => {
    if (!Array.isArray(data)) {
        console.error("The provided data is not an array");
        return;
    }

    const connection = await initializeDatabase();
    try {
        const query = "INSERT IGNORE INTO options_data (ticker, underlying_ticker, strike_price, expiration_date, contract_type) VALUES ?";
        const values = data.map(item => [item.ticker, item.underlying_ticker, item.strike_price, item.expiration_date, item.contract_type]);
        const result = await connection.query(query, [values]);
        
        // Use the affectedRows property to log the actual number of inserted rows
        if(result.affectedRows > 0) {
            console.log(`${result.affectedRows} rows inserted successfully.`);
        } else {
            console.log("No new rows were inserted.");
        }

    } catch (error) {
        console.error("Error inserting data into the database:", error);
        throw error;
    } finally {
        await connection.end();  // Close the connection.
    }
};


// Function to retrieve the first 20 option records for a given underlying_ticker, ordered by expiration_date.
// code changed 31/10
const queryData = async (underlying_ticker) => {
    const connection = await initializeDatabase();
    try {
        const query = "SELECT * FROM options_data WHERE underlying_ticker = ? ORDER BY expiration_date ASC, contract_type, strike_price ASC";
        console.log("Executing query:", query, "with parameter:", underlying_ticker);  // Add this line
        const [rows] = await connection.query(query, [underlying_ticker]);
        
        const today = new Date();
        const filteredRows = rows.filter(row => row.expiration_date > today);
        
        return filteredRows;
    } catch (error) {
        console.error("Error querying data from the database:", error);
        throw error;
    } finally {
        await connection.end();
    }
};


// Function to log each request (underlying_ticker and timestamp) to the options_requests table.
const insertRequestLog = async (underlying_ticker) => {
    const connection = await initializeDatabase();
    try {
        const query = "INSERT INTO options_requests (underlying_ticker, request_date) VALUES (?, NOW())";
        await connection.query(query, [underlying_ticker]);
    } catch (error) {
        console.error("Error logging request to the database:", error);
        throw error;
    } finally {
        await connection.end();  // Close the connection.
    }
};

const checkRequestExists = async (underlying_ticker, date) => {
    const connection = await initializeDatabase();
    try {
        const query = "SELECT * FROM options_requests WHERE underlying_ticker = ? AND DATE(request_date) = DATE(?)";
        console.log("Checking request existence. Query:", query, "Parameters:", underlying_ticker, date); // Add this line
        const [rows] = await connection.query(query, [underlying_ticker, date]);
        
        console.log("Rows found:", rows); // Add this line
        return rows.length > 0;  // Returns true if there's an existing request, false otherwise.
    } catch (error) {
        console.error("Error checking request existence in the database:", error);
        throw error;
    } finally {
        await connection.end();  // Close the connection.
    }
};


export { insertData, queryData, insertRequestLog, checkRequestExists };
