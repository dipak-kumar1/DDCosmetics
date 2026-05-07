const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOrderConfirmationEmail = async (order, userEmail) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Skipping order confirmation email.');
      return;
    }

    const transporter = createTransporter();

    let itemsHtml = '';
    order.items.forEach(item => {
      const productName = item.product?.name || 'Product';
      const productImage = item.product?.images?.[0] || 'https://via.placeholder.com/50';
      itemsHtml += `
        <div style="display: flex; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
          <img src="${productImage}" alt="${productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;" />
          <div>
            <h4 style="margin: 0 0 5px 0; color: #333;">${productName}</h4>
            <p style="margin: 0; color: #666; font-size: 14px;">Qty: ${item.quantity} x ₹${item.price}</p>
            <p style="margin: 5px 0 0 0; color: #111; font-weight: bold;">₹${item.quantity * item.price}</p>
          </div>
        </div>
      `;
    });

    const mailOptions = {
      from: `"DDCosmetics" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation - #${order._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #db2777; margin: 0;">DDCosmetics</h2>
            <p style="color: #666; font-size: 14px;">Thank you for your purchase!</p>
          </div>
          
          <div style="background-color: #fdf2f8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #831843;">Order Confirmed</h3>
            <p style="margin: 0; color: #333; font-size: 14px;"><strong>Order ID:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
            <p style="margin: 5px 0 0 0; color: #333; font-size: 14px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px;">Order Summary</h3>
          <div style="margin-bottom: 20px;">
            ${itemsHtml}
          </div>

          <div style="display: flex; justify-content: space-between; border-top: 2px solid #eee; padding-top: 15px; font-size: 16px;">
            <strong>Total Amount Paid:</strong>
            <strong style="color: #db2777;">₹${order.totalAmount}</strong>
          </div>

          <div style="margin-top: 30px; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Delivery Details</h4>
            <p style="margin: 0; color: #666; font-size: 14px;"><strong>Name:</strong> ${order.fullName}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;"><strong>Phone:</strong> ${order.phoneNumber}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;"><strong>Address:</strong> ${order.address || 'N/A'}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;"><strong>City:</strong> ${order.city || 'N/A'}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;"><strong>Pincode:</strong> ${order.zipCode || 'N/A'}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 12px; margin: 0;">If you have any questions, please contact our support team.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

module.exports = { sendOrderConfirmationEmail };
