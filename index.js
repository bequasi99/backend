require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const { check, validationResult } = require("express-validator");
const cors = require("cors");

const app = express().use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const options = {
  auth: {
    api_key: process.env.SENDGRID_PASSWORD,
  },
};

const client = nodemailer.createTransport(sgTransport(options));

app.post(
  "/contact",
  [
    check("email").isEmail(),
    check("name").not().isEmpty(),
    check("message").not().isEmpty(),
  ],
  function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }

    const email = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: "Website Form Submisions",
      html: `<div>
              <div><strong>Name:</strong> ${req.body.name}<br/></div>
              <div><strong>Email:</strong> ${req.body.email}<br/></div>
              <div><strong>Message:</strong> ${req.body.message}<br/></div>
            </div>`,
    };

    client.sendMail(email, function (err, info) {
      if (err) {
        return res.status(500).json({
          success: false,
          errors: err,
        });
      } else {
        res.json({
          success: true,
          info,
        });
      }
    });
  }
);

app.set("port", 3000);

app.listen(app.get("port"), function () {
  console.log("we are listening on: ", app.get("port"));
});
