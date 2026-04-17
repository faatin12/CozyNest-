const express = require("express");
const cors = require("cors");
const SSLCommerzPayment = require("sslcommerz-lts");

const app = express();

app.use(cors());
app.use(express.json());

const store_id = "YOUR_STORE_ID";
const store_passwd = "YOUR_STORE_PASSWORD";
const is_live = false;

// CREATE PAYMENT ROUTE
app.post("/pay", async (req, res) => {
  try {
    const { cart, customer } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total
    let total_amount = 0;

    cart.forEach(item => {
      total_amount += item.price * item.quantity;
    });

    const tran_id = "TXN_" + Date.now();

    const data = {
      total_amount,
      currency: "BDT",
      tran_id,

      success_url: "http://localhost:5000/success",
      fail_url: "http://localhost:5000/fail",
      cancel_url: "http://localhost:5000/cancel",

      product_name: "Heritage Handspun Order",
      product_category: "Ecommerce",
      product_profile: "general",

      cus_name: customer?.name || "Guest",
      cus_email: customer?.email || "test@gmail.com",
      cus_add1: customer?.address || "Dhaka",
      cus_phone: customer?.phone || "0000000000",

      shipping_method: "NO",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      return res.json({ url: apiResponse.GatewayPageURL });
    }

    res.status(500).json({ message: "Payment init failed" });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// SUCCESS / FAIL / CANCEL
app.post("/success", (req, res) => {
  console.log("SUCCESS PAYMENT:", req.body);
  res.send("Payment Successful");
});

app.post("/fail", (req, res) => {
  console.log("FAILED PAYMENT:", req.body);
  res.send("Payment Failed");
});

app.post("/cancel", (req, res) => {
  res.send("Payment Cancelled");
});

// START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});