const https = require('https');

const SUPABASE_URL = "vuiuorjzonpyobpelyld.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aXVvcmp6b25weW9icGVseWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4MDM2OTksImV4cCI6MjAyMjM3OTY5OX0.ARDJuGYox9CY3K8z287nEEFBmWVLTs6yCLkHHeMMTKw";

async function fetchOpenApi() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SUPABASE_URL,
            path: '/rest/v1/',
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
    const spec = await fetchOpenApi();
    if (spec.definitions) {
        ["SAP_SKU", "BD_ COLORES_GRUPOS"].forEach(t => {
            if (spec.definitions[t]) {
                console.log(`--- Schema for: ${t} ---`);
                console.log("Columns:", Object.keys(spec.definitions[t].properties));
            }
        });
    }
}

main();
