import { NextResponse } from "next/server";
import { loginSAP } from "@/lib/sap";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    try {
        const { sessionId, sessionTimeout } = await loginSAP();
        const baseUrl = process.env.SAP_API_URL?.replace("/Login", "") || "";

        let filterQuery = "";
        if (search) {
            const words = search.trim().split(/\s+/).filter(w => w.length > 0);
            if (words.length > 0) {
                // Para el ItemName (Descripción), buscamos que contenga TODAS las palabras
                const nameFilters = words.map(word => `contains(ItemName, '${word}')`).join(' and ');
                // Para el ItemCode (SKU), buscamos la coincidencia exacta o parcial de la cadena completa
                filterQuery = `&$filter=(${nameFilters}) or contains(ItemCode, '${search}')`;
            }
        }

        const itemsUrl = `${baseUrl}/Items?$select=ItemCode,ItemName&$skip=${offset}&$top=${limit}${filterQuery}`;

        const itemsRes = await fetch(itemsUrl, {
            method: "GET",
            headers: {
                "Cookie": `B1SESSION=${sessionId}; ROUTEID=.node0`,
            }
        });

        if (!itemsRes.ok) {
            throw new Error(`Error fetching SKUs: ${itemsRes.statusText}`);
        }

        const data = await itemsRes.json();

        // Transformar para que coincida con lo que esperaba la UI (SKU y DESCRIPCION)
        const formattedData = data.value.map((item: any) => ({
            SKU: item.ItemCode,
            DESCRIPCION: item.ItemName
        }));

        const hasMore = !!(data['odata.nextLink'] || data['@odata.nextLink']);

        return NextResponse.json({ data: formattedData, hasMore });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
