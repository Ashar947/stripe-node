const express = require("express")
const app = express()
const stripe = require('stripe')('sk_test_51P0w1dClp5yFoXKbqGSszYXJQv763m9351pW4agVo2MaVSgsaT2iMR1K8VDtOr66AI0Pm2JDp38cgXo4U3ktOaaT00M6LhfFcW');
app.use(express.json())


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


app.post('/create-payment-stripe', async (req, res) => {
    try {
        const words = 1000
        const price = 100
        console.log("here")
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
        //     setup_future_usage: "off_session",
        //     customer: "cus_Pqdj1Qe1iZyE5a",
        //     mode: "payment",
        //     success_url: "http://localhost:5000/success2",
        //     cancel_url: "http://localhost:5000/cancel",
        // })
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
            console.log(paymentIntent)
        return res.status(200).json({ id: paymentIntent.client_secret })
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: "Failed" }) // Return a 500 status code for server errors
    }
})

app.listen(5000, () => {
    console.log("Server Running")
})
