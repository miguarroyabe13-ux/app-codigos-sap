import https from "https";

// Configuración de credenciales de SAP
const SAP_COMPANY_DB = process.env.SAP_COMPANY_DB;
const SAP_USERNAME = process.env.SAP_USERNAME;
const SAP_PASSWORD = process.env.SAP_PASSWORD;
const SAP_API_URL = process.env.SAP_API_URL; // e.g. https://200.7.96.194:50000/b1s/v1/Login

// Necesario si el certificado de SAP es autofirmado (muy común)
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function loginSAP() {
    if (!SAP_API_URL || !SAP_COMPANY_DB || !SAP_USERNAME || !SAP_PASSWORD) {
        throw new Error("Faltan credenciales de SAP en las variables de entorno.");
    }

    const payload = {
        CompanyDB: SAP_COMPANY_DB,
        UserName: SAP_USERNAME,
        Password: SAP_PASSWORD,
    };

    try {
        // En Next.js 13+ con Node 18+, para ignorar certificados autofirmados con fetch nativo,
        // a veces es necesario configurar el dispatcher o usar NODE_TLS_REJECT_UNAUTHORIZED
        // Aquí lo habilitamos temporalmente para esta petición por si es necesario
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        const response = await fetch(SAP_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en el login de SAP: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        // El Service Layer de SAP suele devolver un SessionId y requerir que se envíen cookies (B1SESSION y ROUTEID)
        // Para peticiones subsecuentes, debes enviar el SessionId o extraer la cookie 'set-cookie' de los headers.
        const setCookieHeader = response.headers.get("set-cookie");

        return {
            success: true,
            sessionId: data.SessionId,
            version: data.Version,
            sessionTimeout: data.SessionTimeout,
            cookies: setCookieHeader,
            data
        };
    } catch (error) {
        console.error("Error conectando a SAP:", error);
        throw error;
    }
}
