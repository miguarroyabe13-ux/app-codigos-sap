import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializar Resend
// Nota: 'process.env.RESEND_API_KEY' debe ser configurado en el archivo .env / panel de hosting
const resend = new Resend(process.env.RESEND_API_KEY || 'fake_key_for_build');

// URL del webhook de Teams y Correo de Administrador
const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tudominio.com'; // Cambiar por el correo del equipo que revisa

export async function POST(req: Request) {
    try {
        // 1. Validar el Secret del Webhook para asegurar que la petición viene de nuestro Supabase
        // La URL esperada será parecida a: https://tu-sitio.com/api/webhooks/supabase?secret=MI_SECRETO_SEGURO
        const url = new URL(req.url);
        const secret = url.searchParams.get('secret');

        if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
            console.warn("Intento de webhook no autorizado.");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        const { type, record, old_record, table } = payload;

        // Solo nos interesa la tabla solicitudes por ahora
        if (table !== 'solicitudes') {
            return NextResponse.json({ message: 'Ignorado: No es la tabla solicitudes' });
        }

        // --- ESCENARIO 1: NUEVA SOLICITUD (INSERT) ---
        if (type === 'INSERT') {
            console.log('Nueva solicitud detectada, notificando...');

            // A. Notificar a Microsoft Teams
            if (TEAMS_WEBHOOK_URL) {
                const teamsMessage = {
                    "@type": "MessageCard",
                    "@context": "http://schema.org/extensions",
                    "themeColor": "0076D7",
                    "summary": "Nueva Solicitud Creada",
                    "sections": [{
                        "activityTitle": `Nueva Solicitud: ${record.tipo.toUpperCase()}`,
                        "activitySubtitle": `Generada por: ${record.usuario_email || 'Usuario Desconocido'}`,
                        "facts": [
                            { "name": "ID:", "value": record.id },
                            { "name": "Fecha:", "value": new Date(record.created_at).toLocaleString() },
                            { "name": "Comentarios:", "value": record.comentarios || 'Sin observaciones adicionales' }
                        ],
                        "markdown": true
                    }]
                };

                await fetch(TEAMS_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(teamsMessage)
                }).catch(err => console.error('Error enviando notificación a Teams:', err));
            } else {
                console.log("No configuro TEAMS_WEBHOOK_URL, omitiendo Teams.");
            }

            // B. Enviar correo al equipo administrador
            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: 'Notificaciones SAP <onboarding@resend.dev>', // Nota: Para producción debes verificar un dominio en Resend
                    to: [ADMIN_EMAIL],
                    subject: `NUEVA SOLICITUD SAP: Tipo ${record.tipo.toUpperCase()}`,
                    html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #eaeaea;">
                <h2 style="color: #0ea5e9;">Nueva Solicitud Recibida</h2>
                <p>Se ha generado una nueva solicitud en el sistema.</p>
                <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                <p><strong>Tipo de Solicitud:</strong> ${record.tipo}</p>
                <p><strong>Usuario Solicitante:</strong> ${record.usuario_email}</p>
                <p><strong>Fecha:</strong> ${new Date(record.created_at).toLocaleString()}</p>
                <p><strong>Comentarios Adicionales:</strong></p>
                <blockquote style="border-left: 4px solid #0ea5e9; padding-left: 10px; color: #555;">
                  ${record.comentarios || 'Ninguno'}
                </blockquote>
                <p style="margin-top: 30px; font-size: 13px; color: #888;">
                  Por favor, ingresa a la plataforma para aprobar o revisar esta solicitud en detalle.
                </p>
              </div>
            </div>
          `
                }).catch(err => console.error('Error enviando email administrador:', err));
            } else {
                console.log("No configuro RESEND_API_KEY, omitiendo Email a Admin.");
            }
        }

        // --- ESCENARIO 2: CAMBIO DE ESTADO (UPDATE) ---
        if (type === 'UPDATE') {
            // Verificar si realmente cambió el campo 'estado'
            const statusChanged = old_record.estado !== record.estado;

            // Definir los estados que consideramos "resolutivos"
            const finalStates = ['FINALIZADO', 'APROBADO', 'RECHAZADO'];
            const isFinalState = finalStates.includes(record.estado.toUpperCase());

            // Si cambió de estado, el nuevo estado es final, y tenemos un email destino
            if (statusChanged && isFinalState && record.usuario_email) {
                console.log(`Estado cambiado a ${record.estado}, enviando correo al solicitante...`);

                if (process.env.RESEND_API_KEY) {
                    // Determinar color basado en estado para el diseño del email
                    const colorMap: Record<string, string> = {
                        'APROBADO': '#10b981', // Verde
                        'FINALIZADO': '#10b981', // Verde
                        'RECHAZADO': '#ef4444' // Rojo
                    };
                    const mainColor = colorMap[record.estado.toUpperCase()] || '#0ea5e9';

                    await resend.emails.send({
                        from: 'Notificaciones SAP <onboarding@resend.dev>',
                        to: [record.usuario_email],
                        subject: `Respuesta a Solicitud SAP: ${record.estado}`,
                        html: `
                <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                  <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #eaeaea; border-top: 4px solid ${mainColor};">
                    <h2 style="color: #333;">Actualización de tu Solicitud</h2>
                    <p>Hola,</p>
                    <p>El estado de tu solicitud con ID <code>${record.id}</code> ha cambiado a: <strong style="color: ${mainColor};">${record.estado}</strong>.</p>
                    <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                    <p><strong>Tipo de Solicitud original:</strong> ${record.tipo}</p>
                    <p style="margin-top: 30px;">Inicia sesión en la plataforma de SAP para ver más detalles.</p>
                  </div>
                </div>
              `
                    }).catch(err => console.error('Error enviando email a solicitante:', err));
                } else {
                    console.log("No configuro RESEND_API_KEY, omitiendo Email a Solicitante.");
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Webhook procesado correctamente' });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
