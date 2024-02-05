const express = require("express")
const app = express()
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const bodyParser = require("body-parser")
const cors = require("cors")
const session = require("express-session");


// const twilio = require("twilio")
// // Twilio Requirements
// const accountSID = "ACe3074321d28362c4620dde9b1b34d13a";
// const authToken = "11fc67f0cd7de03984ace350da1f19af";
// const client = new twilio(accountSID, authToken);

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(cors()) // Blocks browser from restricting any data

app.get('/', function (req, res) {
    // res.render('index', {});
    res.send('Welcome to the BeautyLynk Express.JS server')
    // res.render('index', {});
    res.send(err)

});

// app.post('/send-text', (req, res) => {
//     // GET Variables, passed via query string
//     let {recipient, textMessage } = req.body
//     try {
//         // console.log(recipient, textMessage)
//         client.messages
//             .create({
//                 body: textMessage,
//                 from: '+14786067242',
//                 to: recipient
//             })
//             .then(message => {
//                 console.log("Message: ", message)
//                 res.json({
//                     message: "Message successful",
//                     success: true
//                 })}
//             )
//             .done();
        

//     } catch (error) {
//         console.log("Error", error)
//     }
//     // Send Text
    
// });

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
            success: true,
            payment: payment
        })
        console.log("Response: ", res)

    } catch (error) {
        console.log("Error", error)
        res.json({
            message: "Payment failed",
            success: false
        })
    }

})

//Refund Route for Stripe
app.post("/refund", cors(), async(req, res) => {
  let {intent} = req.body

  try{
    const refund = await stripe.refunds.create({
      payment_intent: intent,
    });
    console.log("Refund: ", refund)
    res.json({
        message: "Refund successful",
        success: true,
        refund: refund
    })

  } catch(error) {
    console.log("Error", error)
    res.json({
        message: "Refund failed",
        success: false
    })
  }
})

app.use(express.static(process.env.STATIC_DIR));
app.use(
    session({
        secret: "Set this to a random string that is kept secure",
        resave: false,
        saveUninitialized: true,
    })
);

// Stripe connect onboarding
app.post("/onboard-user", async (req, res) => {
    try {
      const account = await stripe.accounts.create({
        type: 'standard',
      });
  
      // Store the ID of the new Standard connected account.
      req.session.accountID = account.id;
  
      const origin = `${req.headers.origin}`;
      const accountLink = await stripe.accountLinks.create({
        type: "account_onboarding",
        account: account.id,
        refresh_url: `${origin}/onboard-user/refresh`,
        return_url: `${origin}/dashboard?accID=${account.id}`,
      });
  
      console.log("Normal req: ",req)
      console.log("SESSION INFO: ",req.session)
      res.redirect(303, accountLink.url);
    } catch (err) {
      res.status(500).send({
        error: err.message,
      });
    }
  });

  // Stripe Connect refresh
  app.get("/onboard-user/refresh", async (req, res) => {
    if (!req.session.accountID) {
      res.redirect("/");
      return;
    }
  
    try {
      const { accountID } = req.session;
      const origin = `${req.secure ? "https://" : "http://"}${req.headers.host}`;
  
      const accountLink = await stripe.accountLinks.create({
        type: "account_onboarding",
        account: accountID,
        refresh_url: `${origin}/onboard-user/refresh`,
        return_url: `${origin}/dashboard`,
      });
      console.log("Refresh res: ",req)
      console.log("SESSION INFO: ",req.session)
      res.redirect(303, accountLink.url);
    } catch (err) {
      res.status(500).send({
        error: err.message,
      });
    }
  });
  

// The server will be listening on port given in env file or default to port 4000
app.listen(process.env.PORT || 4000, () => {
    console.log("" +
    "\n     (^ᴗ^)ノ" + "\n" +
    "\n     " + "BeautyLynk" +
    "\n     is listening on port " + 4000 + "\n")
})




// const express = require("express")
// const app = express()
// require("dotenv").config()
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
// const bodyParser = require("body-parser")
// const cors = require("cors")

// app.use(bodyParser.urlencoded({extended: true}))
// app.use(bodyParser.json())

// app.use(cors())

// app.get('/', function (req, res) {
//   res.send('Welcome to the BeautyLynk Express.JS server')
// });
  
// //Payment Route for Stripe
// app.post("/payment", cors(), async(req, res) => {
//     let {amount, id, description} = req.body
//     try {
//         const payment = await stripe.paymentIntents.create({
//             amount,
//             currency: "USD",
//             description: description,
//             payment_method: id,
//             confirm: true
//         })
//         console.log("Payment: ", payment)
//         res.json({
//             message: "Payment successful",
//             success: true
//         })

//     } catch (error) {
//         console.log("Error", error)
//         res.json({
//             message: "Payment failed",
//             success: false
//         })
//     }
// })

// // The server will be listening on port given in env file or default to port 4000
// app.listen(process.env.PORT || 4000, () => {
//     console.log("" +
//     "\n     (^ᴗ^)ノ" + "\n" +
//     "\n     " + "BeautyLynk" +
//     "\n     is listening on " + 4000 + "\n")
// })