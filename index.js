const express = require("express")
const app = express()
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const bodyParser = require("body-parser")
const cors = require("cors")

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(cors())

//Payment Route for Stripe
app.post("/payment", cors(), async(req, res) => {
    let {amount, id, description} = req.body
    try {
        const payment = await stripe.paymentIntents.create({
            amount,
            currency: "USD",
            description: description,
            payment_method: id,
            confirm: true
        })
        console.log("Payment: ", payment)
        res.json({
            message: "Payment successful",
            success: true
        })

    } catch (error) {
        console.log("Error", error)
        res.json({
            message: "Payment failed",
            success: false
        })
    }
})

// The server will be listening on port given in env file or default to port 4000
app.listen(process.env.PORT || 4000, () => {
    console.log("" +
    "\n     (^ᴗ^)ノ" + "\n" +
    "\n     " + "BeautyLynk" +
    "\n     is listening on " + 4000 + "\n")
})