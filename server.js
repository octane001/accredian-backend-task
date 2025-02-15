import express from "express";
import cors from "cors";
import pkg from "body-parser";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables
const { json } = pkg;
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.LESS_SECURE_PASS, // Use App Passwords instead
  },
});

app.post("/", async (req, res) => {
  const { yourName, yourEmail, friendName, friendEmail } = req.body;

  try {
    const newReferral = await prisma.referral.create({
      data: { yourName, yourEmail, friendName, friendEmail },
    });

    const mailOptions = {
      from: process.env.USER_MAIL,
      to: friendEmail,
      subject: `${yourName} has invited you to join Accredian! 🎉`,
      html: `<p>Hi ${friendName},</p>
             <p>Your friend ${yourName} thinks you’ll love Accredian and has referred you to join our learning community! 🎓</p>
             <p>Ready to get started? <a href="https://accredian.com/">Join Accredian Now</a></p>
             <p>Happy learning,</p><p>The Accredian Team</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send email." });
      }
      console.log("Email sent successfully:", info.response);
      res.status(201).json({ message: "Referral saved and email sent!", newReferral });
    });
  } catch (error) {
    console.error("Error saving referral:", error);
    res.status(500).json({ error: "Failed to save referral." });
  }
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
