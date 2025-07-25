import nodemailer from 'nodemailer';

/**
 * Servicio de notificaciones por email
 * Configurado con Nodemailer para Gmail y Ethereal para desarrollo
 */
export class EmailService {
  
  /**
   * Configuración del servicio de email
   */
  static CONFIG = {
    FROM_EMAIL: process.env.EMAIL_USER || 'noreply@vallemarkets.cl',
    COMPANY_NAME: 'Valle Markets',
    COMPANY_PHONE: '+56 9 1234 5678',
    SUPPORT_EMAIL: 'soporte@vallemarkets.cl'
  };

  /**
   * Crear transporter para envío de emails
   */
  static async createTransporter() {
    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_USER) {
      // Configuración para Gmail en producción
      return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // App Password de Gmail
        }
      });
    } else {
      // Configuración para desarrollo (Ethereal Email)
      let testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }
  }

  /**
   * Enviar email genérico
   */
  static async sendEmail(to, subject, html) {
    try {
      const transporter = await this.createTransporter();
      
      const info = await transporter.sendMail({
        from: `"${this.CONFIG.COMPANY_NAME}" <${this.CONFIG.FROM_EMAIL}>`,
        to: to,
        subject: subject,
        html: html
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }

      console.log(`✅ Email enviado a ${to}: ${subject}`);
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      // Fallback a console.log para desarrollo
      console.log(`📧 FALLBACK - Email a ${to}: ${subject}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notificar al comprador que su orden ha sido completada
   */
  static async notifyOrderCompleted(buyerEmail, buyerName, orderId, orderTotal) {
    const subject = '✅ Tu pedido ha sido entregado - Valle Markets';
    const message = this.generateOrderCompletedEmail(buyerName, orderId, orderTotal);
    
    return await this.sendEmail(buyerEmail, subject, message);
  }

  /**
   * Notificar al vendedor sobre una nueva orden
   */
  static async notifySellerNewOrder(sellerEmail, sellerName, orderId, orderTotal, buyerName) {
    const subject = '🛒 Nueva orden recibida - Valle Markets';
    const message = this.generateNewOrderEmail(sellerName, orderId, orderTotal, buyerName);
    
    console.log(`📧 EMAIL NOTIFICATION`);
    console.log(`To: ${sellerEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);
    
    return this.sendEmail(sellerEmail, subject, message);
  }

  /**
   * Notificar al vendedor sobre comisiones pendientes
   */
  static async notifyCommissionEarned(sellerEmail, sellerName, orderId, commissionAmount) {
    const subject = '💰 Nueva comisión ganada - Valle Markets';
    const message = this.generateCommissionEmail(sellerName, orderId, commissionAmount);
    
    console.log(`📧 EMAIL NOTIFICATION`);
    console.log(`To: ${sellerEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);
    
    return this.sendEmail(sellerEmail, subject, message);
  }

  /**
   * Generar template de email para orden completada
   */
  static generateOrderCompletedEmail(buyerName, orderId, orderTotal) {
    return `
Hola ${buyerName},

¡Excelentes noticias! Tu pedido ha sido entregado exitosamente.

📦 Detalles del pedido:
• Número de orden: ${orderId}
• Total: $${orderTotal.toLocaleString('es-CL')}
• Estado: ENTREGADO ✅

Esperamos que disfrutes tu compra. Si tienes alguna consulta o problema con tu pedido, no dudes en contactarnos.

¡Gracias por elegir Valle Markets!

---
${this.CONFIG.COMPANY_NAME}
📞 ${this.CONFIG.COMPANY_PHONE}
📧 ${this.CONFIG.SUPPORT_EMAIL}
    `.trim();
  }

  /**
   * Generar template de email para nueva orden (vendedor)
   */
  static generateNewOrderEmail(sellerName, orderId, orderTotal, buyerName) {
    return `
Hola ${sellerName},

¡Has recibido una nueva orden en Valle Markets!

📦 Detalles de la orden:
• Número de orden: ${orderId}
• Cliente: ${buyerName}
• Total: $${orderTotal.toLocaleString('es-CL')}
• Estado: PENDIENTE DE ACEPTACIÓN

Por favor ingresa a tu panel de vendedor para revisar y aceptar esta orden.
Tienes 24 horas para responder, o la orden será aceptada automáticamente.

¡Gracias por ser parte de Valle Markets!

---
${this.CONFIG.COMPANY_NAME}
📞 ${this.CONFIG.COMPANY_PHONE}
📧 ${this.CONFIG.SUPPORT_EMAIL}
    `.trim();
  }

  /**
   * Generar template de email para comisión ganada
   */
  static generateCommissionEmail(sellerName, orderId, commissionAmount) {
    return `
Hola ${sellerName},

¡Has ganado una nueva comisión! 💰

💵 Detalles de la comisión:
• Orden: ${orderId}
• Comisión ganada: $${commissionAmount.toLocaleString('es-CL')}
• Estado: PENDIENTE DE PAGO

Tu comisión será procesada en el próximo ciclo de pagos.
Puedes revisar todas tus comisiones en tu panel de vendedor.

¡Sigue vendiendo con Valle Markets!

---
${this.CONFIG.COMPANY_NAME}
📞 ${this.CONFIG.COMPANY_PHONE}
📧 ${this.CONFIG.SUPPORT_EMAIL}
    `.trim();
  }

  /**
   * Enviar email (implementación mockup para MVP)
   */
  static async sendEmail(to, subject, message) {
    try {
      // Simulamos el envío de email
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // En producción, aquí usarías un servicio real de email como:
      // - SendGrid
      // - NodeMailer con Gmail/SMTP
      // - Amazon SES
      // - Mailgun
      
      console.log(`✅ Email enviado exitosamente a ${to}`);
      return { success: true, to, subject };
      
    } catch (error) {
      console.error(`❌ Error enviando email a ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación de bienvenida a nuevo PyME
   */
  static async sendWelcomeEmail(sellerEmail, sellerName, businessName) {
    const subject = '🎉 ¡Bienvenido a Valle Markets!';
    const message = `
Hola ${sellerName},

¡Bienvenido a Valle Markets! Tu negocio "${businessName}" ha sido registrado exitosamente en nuestra plataforma.

🎯 Próximos pasos:
1. Agrega tus primeros productos
2. Configura tu perfil de vendedor
3. ¡Comienza a vender!

Nuestro equipo está aquí para ayudarte en cada paso. Si tienes preguntas, no dudes en contactarnos.

¡Esperamos verte crecer con Valle Markets!

---
${this.CONFIG.COMPANY_NAME}
📞 ${this.CONFIG.COMPANY_PHONE}
📧 ${this.CONFIG.SUPPORT_EMAIL}
    `.trim();

    return this.sendEmail(sellerEmail, subject, message);
  }
}
