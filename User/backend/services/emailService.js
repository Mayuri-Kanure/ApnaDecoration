const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

class EmailService {
  constructor() {
    // Temporarily disabled to prevent startup errors
    // this.transporter = null;
    // this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER || "your-email@gmail.com",
          pass: process.env.EMAIL_PASS || "your-app-password",
        },
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error("❌ Email service connection failed:", error);
        } else {
          console.log("✅ Email service is ready");
        }
      });
    } catch (error) {
      console.error("❌ Error initializing email service:", error);
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(order, customerEmail) {
    try {
      console.log("📧 Sending order confirmation email for order:", order._id);

      const emailContent = this.generateOrderConfirmationEmail(order);

      const mailOptions = {
        from: `"APNA DECORATION" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `Order Confirmation - #${order._id?.slice(-8)}`,
        html: emailContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Order confirmation email sent:", result.messageId);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("❌ Error sending order confirmation email:", error);
      throw new Error("Failed to send order confirmation email");
    }
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(order, paymentDetails) {
    try {
      console.log(
        "📧 Sending payment confirmation email for order:",
        order._id,
      );

      const emailContent = this.generatePaymentConfirmationEmail(
        order,
        paymentDetails,
      );

      const mailOptions = {
        from: `"APNA DECORATION" <${process.env.EMAIL_USER}>`,
        to: order.customerEmail || order.userId?.email,
        subject: `Payment Confirmed - Order #${order._id?.slice(-8)}`,
        html: emailContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Payment confirmation email sent:", result.messageId);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("❌ Error sending payment confirmation email:", error);
      throw new Error("Failed to send payment confirmation email");
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(order, newStatus) {
    try {
      console.log("📧 Sending order status update email for order:", order._id);

      const emailContent = this.generateOrderStatusUpdateEmail(
        order,
        newStatus,
      );

      const mailOptions = {
        from: `"APNA DECORATION" <${process.env.EMAIL_USER}>`,
        to: order.customerEmail || order.userId?.email,
        subject: `Order Status Update - #${order._id?.slice(-8)}`,
        html: emailContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Order status update email sent:", result.messageId);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("❌ Error sending order status update email:", error);
      throw new Error("Failed to send order status update email");
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    try {
      console.log("📧 Sending welcome email to:", user.email);

      const emailContent = this.generateWelcomeEmail(user);

      const mailOptions = {
        from: `"APNA DECORATION" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Welcome to APNA DECORATION!",
        html: emailContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Welcome email sent:", result.messageId);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("❌ Error sending welcome email:", error);
      throw new Error("Failed to send welcome email");
    }
  }

  // Generate order confirmation email HTML
  generateOrderConfirmationEmail(order) {
    const orderId = order._id?.slice(-8) || "N/A";
    const orderTotal = order.pricing?.total || 0;
    const customerName = order.customerName || order.userId?.name || "Customer";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - APNA DECORATION</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2F66FF; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
          .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; background: #2F66FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for choosing APNA DECORATION</p>
          </div>

          <div class="content">
            <h2>Order Details</h2>
            <div class="order-details">
              <p><strong>Order Number:</strong> #${orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${orderTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus || "Pending"}</p>
              <p><strong>Order Status:</strong> ${order.orderStatus || "Processing"}</p>
            </div>

            <h3>Shipping Address</h3>
            <div class="order-details">
              <p>${customerName}</p>
              <p>${order.shippingAddress?.street}</p>
              <p>${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.zipCode}</p>
              <p>${order.shippingAddress?.country}</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="https://apnadecoration.com/orders/${order._id}" class="btn">Track Your Order</a>
            </div>
          </div>

          <div class="footer">
            <p>© 2026 APNA DECORATION. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate payment confirmation email HTML
  generatePaymentConfirmationEmail(order, paymentDetails) {
    const orderId = order._id?.slice(-8) || "N/A";
    const paymentAmount = paymentDetails.amount || order.pricing?.total || 0;
    const customerName = order.customerName || order.userId?.name || "Customer";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmed - APNA DECORATION</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28C76F; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
          .payment-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; background: #28C76F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Confirmed!</h1>
            <p>Your payment has been successfully processed</p>
          </div>

          <div class="content">
            <h2>Payment Details</h2>
            <div class="payment-details">
              <p><strong>Order Number:</strong> #${orderId}</p>
              <p><strong>Payment Amount:</strong> ₹${paymentAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod || "Razorpay"}</p>
              <p><strong>Payment ID:</strong> ${paymentDetails.razorpay_payment_id || "N/A"}</p>
              <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <h3>Order Status</h3>
            <div class="payment-details">
              <p><strong>Status:</strong> <span style="color: #28C76F;">Confirmed</span></p>
              <p>Your order is now being processed and will be delivered soon.</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="https://apnadecoration.com/orders/${order._id}" class="btn">View Order Details</a>
            </div>
          </div>

          <div class="footer">
            <p>© 2026 APNA DECORATION. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate order status update email HTML
  generateOrderStatusUpdateEmail(order, newStatus) {
    const orderId = order._id?.slice(-8) || "N/A";
    const customerName = order.customerName || order.userId?.name || "Customer";

    const statusColors = {
      pending: "#FF9F43",
      confirmed: "#00CFE8",
      processing: "#2F66FF",
      "out-for-delivery": "#FF9F43",
      delivered: "#28C76F",
      cancelled: "#EA5455",
    };

    const statusColor = statusColors[newStatus] || "#666";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update - APNA DECORATION</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
          .status-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; background: ${statusColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Status Update</h1>
            <p>Your order status has been updated</p>
          </div>

          <div class="content">
            <h2>Order Status</h2>
            <div class="status-details">
              <p><strong>Order Number:</strong> #${orderId}</p>
              <p><strong>New Status:</strong> <span style="color: ${statusColor}; text-transform: capitalize;">${newStatus}</span></p>
              <p><strong>Updated On:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="https://apnadecoration.com/orders/${order._id}" class="btn">Track Your Order</a>
            </div>
          </div>

          <div class="footer">
            <p>© 2026 APNA DECORATION. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate welcome email HTML
  generateWelcomeEmail(user) {
    const customerName = user.name || user.firstName || "Customer";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to APNA DECORATION</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2F66FF; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
          .welcome-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; background: #2F66FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Welcome to APNA DECORATION!</h1>
            <p>We're excited to have you join our community</p>
          </div>

          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <div class="welcome-info">
              <p>Thank you for registering with APNA DECORATION. We're here to help make your events memorable with our beautiful decoration services.</p>

              <h3>What's Next?</h3>
              <ul>
                <li>Browse our amazing decoration products</li>
                <li>Book our professional decoration services</li>
                <li>Enjoy exclusive member benefits</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="https://apnadecoration.com" class="btn">Start Shopping</a>
            </div>
          </div>

          <div class="footer">
            <p>© 2026 APNA DECORATION. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
