const https = require('https');

const SUPABASE_URL = "vuiuorjzonpyobpelyld.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aXVvcmp6b25weW9icGVseWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4MDM2OTksImV4cCI6MjAyMjM3OTY5OX0.ARDJuGYox9CY3K8z287nEEFBmWVLTs6yCLkHHeMMTKw";

async function fetchTable(tableName) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SUPABASE_URL,
            path: `/rest/v1/${encodeURIComponent(tableName)}?select=*&limit=1`,
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    resolve({ error: "Parse Error", raw: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function main() {
    const targetTables = ["sap_sku", "BD_ COLORES_GRUPOS", "BD_ COLORES_VERSIÓN"];
    for (const t of targetTables) {
        console.log(`--- Table: ${t} ---`);
        const data = await fetchTable(t);
        if (Array.isArray(data) && data.length > 0) {
            console.log("Keys:", Object.keys(data[0]));
            console.log("Sample:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("Error or Empty:", data);
        }
    }
}

main();
