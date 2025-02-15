import express from "express";
import cors from "cors";
import pkg from "body-parser";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const { json } = pkg;

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.LESS_SECURE_PASS,
  },
});

app.post("/api/referrals", async (req, res) => {
  const { yourName, yourEmail, friendName, friendEmail } = req.body;

  try {
    // Save the data coming from Frontend to Data Base
    const newReferral = await prisma.referral.create({
      data: {
        yourName,
        yourEmail,
        friendName,
        friendEmail,
      },
    });

    const mailOptions = {
      from: process.env.USER_MAIL,
      to: friendEmail,
      subject: `${yourName} has invited you to join Accredian! 🎉`,
      text: `Hi ${friendName},\n\nYour friend ${yourName} thinks you’ll love Accredian and has referred you to join our learning community! 🎓 Discover a world of knowledge, enhance your skills, and start your learning journey today.\n\nReady to get started? Just click the link below:\n🔗 [Join Accredian Now](https://accredian.com/)\n\nDon’t miss this chance to upskill and grow!\n\nHappy learning,\nThe Accredian Team`
    };
    

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent successfully:", info.response);
      }
    });

    res
      .status(201)
      .json({ message: "Referral saved successfully!", newReferral });
  } catch (error) {
    console.error("Error saving referral:", error);
    res.status(500).json({ error: "Failed to save referral." });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
