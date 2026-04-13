const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectData() {
    console.log("--- Inspecting SAP_SKU ---");
    const { data: skuData, error: skuErr } = await supabase.from('SAP_SKU').select('*').limit(5);
    if (skuErr) {
        console.error("Error SAP_SKU:", skuErr.message);
        console.log("Searching variants...");
        const { data: skuData2, error: skuErr2 } = await supabase.from('SAP SKU').select('*').limit(5);
        if (skuErr2) console.error("Error SAP SKU:", skuErr2.message);
        else console.log("SAP SKU (with space) Data:", JSON.stringify(skuData2, null, 2));
    } else {
        console.log("SAP_SKU Data:", JSON.stringify(skuData, null, 2));
    }

    console.log("\n--- Inspecting BD_ COLORES_GRUPOS ---");
    const { data: colorData, error: colorErr } = await supabase.from('BD_ COLORES_GRUPOS').select('*').limit(5);
    if (colorErr) console.error("Error BD_ COLORES_GRUPOS:", colorErr.message);
    else console.log("BD_ COLORES_GRUPOS Data:", JSON.stringify(colorData, null, 2));
}

inspectData();
