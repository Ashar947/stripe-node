const express = require("express")
const app = express()
const stripe = require('stripe')('sk_test_51P0w1dClp5yFoXKbqGSszYXJQv763m9351pW4agVo2MaVSgsaT2iMR1K8VDtOr66AI0Pm2JDp38cgXo4U3ktOaaT00M6LhfFcW');
app.use(express.json())
const payment_method = "pm_1P1eS9Clp5yFoXKb7G9uyaFd"
const customer_id = "cus_Pqdj1Qe1iZyE5a"
const axios = require('axios');


app.get('/', (req, res) => {
    return res.status(200).send("Working")
})


app.post('/customer', async (req, res) => {
    try {
        const body = {
            balance: 0,
            description: "Customer From Node Server",
            name: "Ashar",
            phone: 923323610637,
            email: "ashariqbal947@gmail.com"
        }
        const customer = await stripe.customers.create(body);
        return res.status(200).json({ message: "Customer Created", data: { customer } })
    } catch (error) {
        return res.status(400).json(error)
    }
})
app.get('/customer/:id', async (req, res) => {
    try {
        const { id } = req.params
        const customer = await stripe.customers.retrieve(id);
        return res.status(200).json({ message: "Customer Created", data: { customer } })
    } catch (error) {
        return res.status(400).json(error)
    }
})

app.post('/customer/card/:id', async (req, res) => {
    try {
        // const token = await stripe.tokens.create({
        //     card: {
        //       number: '4242424242424242',
        //       exp_month: '5',
        //       exp_year: '2024',
        //       cvc: '314',
        //     },
        //   });
        //   console.log('token')
        const createCard = await stripe.customers.createSource(req.params.id, { source: 'tok_mastercard' })
        return res.status(200).json({ message: "Card Created", data: { card: createCard } })
    } catch (error) {
        return res.status(400).json(error)
    }

})

app.get('/customer/all/cards', async (req, res) => {
    const paymentMethods = await stripe.paymentMethods.list({
        customer: customer_id,
        type: 'card',
    });
    return res.status(200).json({ data: paymentMethods })


    const stripeSecretKey = 'sk_test_51P0w1dClp5yFoXKbqGSszYXJQv763m9351pW4agVo2MaVSgsaT2iMR1K8VDtOr66AI0Pm2JDp38cgXo4U3ktOaaT00M6LhfFcW';

    await axios.get(`https://api.stripe.com/v1/customers/${customer_id}/cards`, {
        params: {
            limit: 3
        },
        headers: {
            'Authorization': `Bearer ${stripeSecretKey}`
        }
    })
        .then(response => {
            return res.status(200).json({ data: response.data })
        })
        .catch(error => {
            return res.status(400).json({ error })

        });

})

app.post('/create/customer/card', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'setup',
            currency: 'usd',
            customer: customer_id,
            success_url: 'http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://localhost:5000/cancel',
        });
        return res.status(200).json({ id: session.id })

    } catch (error) {
        return res.status(400).json({ error })
    }
})



app.post('/create-payment-stripe', async (req, res) => {
    try {
        const words = 1000
        const price = 100
        console.log("here2")
        const amountInCents = price * 100;
        // const session = await stripe.checkout.sessions.create({
        //     line_items: [
        //         {
        //             price_data: {
        //                 currency: 'usd',
        //                 unit_amount: price * 100, // Amount in cents
        //                 product_data: {
        //                     name: `Custom Product Name ${words}`,
        //                 },
        //             },
        //             quantity: 1,
        //         },
        //     ],
        //     mode: 'payment',
        //     payment_method_types: ['card'],
        //     customer: "cus_Pqdj1Qe1iZyE5a",
        //     // setup_future_usage: 'on_session',
        //     mode: "payment",
        //     success_url: "http://localhost:5000/success2",
        //     cancel_url: "http://localhost:5000/cancel",
        // })

        // const session = await stripe.checkout.sessions.create({
        //     mode: 'setup',
        //     currency: 'usd',
        //     customer: 'cus_Pqdj1Qe1iZyE5a',
        //     success_url: 'http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}',
        //     cancel_url: 'https://localhost:5000/cancel',
        // });

        const paymentIntent = await stripe.paymentIntents.create
            ({
                customer
                    : "cus_Pqdj1Qe1iZyE5a",
                setup_future_usage
                    : 'off_session',
                amount
                    : 1099,
                currency
                    : 'usd',
            });
        console.log(paymentIntent.client_secret)
        return res.status(200).json({ id: paymentIntent.client_secret })
    } catch (error) {
        console.error(error, "error"); // Log the error for debugging
        return res.status(500).json({ message: "Failed" }) // Return a 500 status code for server errors
    }
})


app.get('/success', async (req, res) => {
    try {
        const session_id = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(session_id);
        // return res.status(200).json({ message: "Done",  session, session_id })

        const setupIntent_id = await session.setup_intent
        const setupIntent = await stripe.setupIntents.retrieve(setupIntent_id);
        return res.status(200).json({ payment_method: setupIntent.payment_method, message: "Done", setupIntent, session, session_id })
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
})

app.get('/cancel', async (req, res) => {
    return res.status(200).send("Cancelled")
})


app.post('/charge/customer', async (req, res) => {
    try {
        console.log("/charge/customer")
        const paymentIntent = await stripe.paymentIntents.create({
            customer: customer_id,
            payment_method: payment_method,
            amount: 10 * 100,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
                allow_redirects : 'never'
            },
            confirm: true,
            receipt_email : "ashariqbal947@gmail.com"
        });
        return res.status(200).json({ paymentIntent })

    } catch (error) {
        res.status(400).json({ error })
    }
})

app.listen(5000, () => {
    console.log("Server Running")
})
