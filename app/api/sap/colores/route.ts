import { NextResponse } from "next/server";
import { loginSAP } from "@/lib/sap";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    try {
        const { sessionId } = await loginSAP();
        const baseUrl = process.env.SAP_API_URL?.replace("/Login", "") || "";

        let filterQuery = "";
        if (search) {
            const words = search.trim().split(/\s+/).filter(w => w.length > 0);
            if (words.length > 0) {
                const nameFilters = words.map(word => `contains(Name, '${word}')`).join(' and ');
                filterQuery = `&$filter=(${nameFilters}) or contains(Code, '${search}')`;
            }
        }

        const url = `${baseUrl}/U_FIR_COLOR?$skip=${offset}&$top=${limit}${filterQuery}`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Cookie": `B1SESSION=${sessionId}; ROUTEID=.node0`,
            }
        });

        if (!res.ok) {
            throw new Error(`Error fetching Colors: ${res.statusText}`);
        }

        const data = await res.json();

        // Transformar para que coincida con lo que esperaba la UI (CodigoColor y Color)
        const formattedData = data.value.map((item: any) => ({
            CodigoColor: item.Code,
            Color: item.Name
        }));

        const hasMore = !!(data['odata.nextLink'] || data['@odata.nextLink']);

        return NextResponse.json({ data: formattedData, hasMore });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
