const {Pool} = require('pg')
const dotenv = require('dotenv')

dotenv.config();

const pool = new Pool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    port : Number(process.env.DB_PORT),
    password : String(process.env.DB_PASSWORD || ""),
    database : process.env.DB_NAME
});

pool.on('connect',()=>{
    console.log("Postgres Connection")
})

module.exports = pool
