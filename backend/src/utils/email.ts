import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export const sendBookingConfirmation = async (
  email: string,
  bookingDetails: {
    bookingId: string;
    experienceTitle: string;
    startDate: string;
    endDate: string;
    totalPrice: string;
  }
): Promise<void> => {
  const html = `
    <h1>Booking Confirmation</h1>
    <p>Thank you for your booking!</p>
    <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
    <p><strong>Experience:</strong> ${bookingDetails.experienceTitle}</p>
    <p><strong>Start Date:</strong> ${bookingDetails.startDate}</p>
    <p><strong>End Date:</strong> ${bookingDetails.endDate}</p>
    <p><strong>Total Price:</strong> ${bookingDetails.totalPrice}</p>
    <p>We look forward to your experience!</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Booking Confirmation - Experience Bangladesh',
    html,
  });
};

export const sendCancellationEmail = async (
  email: string,
  bookingId: string
): Promise<void> => {
  const html = `
    <h1>Booking Cancelled</h1>
    <p>Your booking has been successfully cancelled.</p>
    <p><strong>Booking ID:</strong> ${bookingId}</p>
    <p>If you have any questions, please contact us.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Booking Cancelled - Experience Bangladesh',
    html,
  });
};
