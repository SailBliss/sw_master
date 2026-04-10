// Centraliza el envío de emails transaccionales de SW Mujeres usando Nodemailer + Gmail SMTP,
// evitando duplicar la configuración del transporter en cada módulo que necesite notificar.

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<void> {
  await transporter.sendMail({
    from: `"SW Mujeres" <${process.env.EMAIL_FROM}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  })
}

// ─── Notificaciones de admin ────────────────────────────────────────────────

export async function notifyAdminNewApplication(data: {
  entrepreneurName: string
  businessName: string
  category: string
}): Promise<void> {
  const adminEmails = (process.env.EMAIL_ADMIN ?? '').split(',').map(e => e.trim()).filter(Boolean)

  await sendEmail(
    adminEmails,
    `Nueva solicitud de ingreso: ${data.businessName}`,
    `
    <div style="font-family: sans-serif; color: #333; max-width: 600px;">
      <h2 style="color: #7c3aed;">Nueva solicitud recibida</h2>
      <p>Hola equipo SW Mujeres,</p>
      <p>Se ha recibido una nueva solicitud de ingreso al directorio:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; font-weight: bold; width: 40%;">Empresaria:</td>
          <td style="padding: 8px;">${data.entrepreneurName}</td>
        </tr>
        <tr style="background: #f5f3ff;">
          <td style="padding: 8px; font-weight: bold;">Emprendimiento:</td>
          <td style="padding: 8px;">${data.businessName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Categoría:</td>
          <td style="padding: 8px;">${data.category}</td>
        </tr>
      </table>
      <p>Ingresa al panel de administración para revisar y gestionar la solicitud.</p>
      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">— SW Mujeres · Sistema de notificaciones</p>
    </div>
    `
  )
}

// ─── Notificaciones a empresarias ────────────────────────────────────────────

export async function notifyEntrepreneurApproved(data: {
  to: string
  entrepreneurName: string
  businessName: string
}): Promise<void> {
  await sendEmail(
    data.to,
    `¡Tu emprendimiento fue aprobado! — ${data.businessName}`,
    `
    <div style="font-family: sans-serif; color: #333; max-width: 600px;">
      <h2 style="color: #7c3aed;">¡Bienvenida a SW Mujeres! 🎉</h2>
      <p>Hola <strong>${data.entrepreneurName}</strong>,</p>
      <p>
        Nos alegra mucho informarte que tu emprendimiento
        <strong>${data.businessName}</strong> ha sido aprobado
        y ya forma parte de nuestro directorio.
      </p>
      <p>
        En los próximos días verás tu perfil publicado. Si tienes alguna duda o
        quieres actualizar tu información, no dudes en escribirnos.
      </p>
      <p>¡Gracias por ser parte de esta comunidad!</p>
      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">Con cariño,<br>El equipo de SW Mujeres</p>
    </div>
    `
  )
}

export async function notifyEntrepreneurRejected(data: {
  to: string
  entrepreneurName: string
  notes?: string
}): Promise<void> {
  const notesBlock = data.notes
    ? `<p><strong>Comentarios del equipo:</strong><br>${data.notes}</p>`
    : ''

  await sendEmail(
    data.to,
    'Actualización sobre tu solicitud — SW Mujeres',
    `
    <div style="font-family: sans-serif; color: #333; max-width: 600px;">
      <h2 style="color: #7c3aed;">Actualización de tu solicitud</h2>
      <p>Hola <strong>${data.entrepreneurName}</strong>,</p>
      <p>
        Gracias por tu interés en formar parte del directorio de SW Mujeres.
        Luego de revisar tu solicitud, en esta ocasión no podemos incluir tu
        emprendimiento en el directorio.
      </p>
      ${notesBlock}
      <p>
        Si crees que hubo un error o quieres más información, escríbenos con
        gusto te atendemos.
      </p>
      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">Con cariño,<br>El equipo de SW Mujeres</p>
    </div>
    `
  )
}
