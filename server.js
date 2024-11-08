import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';
import session from 'express-session'; // For managing sessions
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';// For hashing passwords
import MongoStore from 'connect-mongo';// Session store in MongoDB
import User from './model/users.js';

dotenv.config();

mongoose.connect("mongodb://localhost:27017/market")
        .then(() => console.log("connected to Database"))
        .catch((err) => console.log(`Error: ${err}`))

// Initialize app
const app = express();
app.use(express.static('public'));
app.use(express.json());


// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/market" })
}));



// Stripe initialization
const stripeGateway = stripe(process.env.STRIPE_API);
const DOMAIN = process.env.DOMAIN;

// Route for home page (main e-commerce page)
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// Routes for success and cancel pages (after payment)
app.get('/success', (req, res) => {
    res.sendFile('success.html', { root: 'public' });
});
app.get('/cancel', (req, res) => {
    res.sendFile('cancel.html', { root: 'public' });
});





// Route for signup
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created" });
    } catch (err) {
        res.status(500).json({ error: "Failed to create user" });
    }
});

// Route for login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id; // Save user in session
            res.json({ message: "Login successful" });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// Middleware to check if logged in
function checkAuth(req, res, next) {
    if (req.session.userId) {
        next(); // If logged in, continue
    } else {
        res.status(401).json({ error: "Please log in first" });
    }
}


// Use checkAuth on Stripe route to restrict to logged-in users
app.post("/stripe-checkout", checkAuth, async (req, res) => {
    try {
        const lineItems = req.body.items.map((item) => {
            const unitAmount = Math.round(parseFloat(item.price.replace(/[^0-9.-]+/g, "") * 100));
            console.log("item-price:", item.price);
            console.log("unitAmount", unitAmount);
            return {
                price_data: {
                    currency: 'usd',
                    product_data:  {
                        name: item.title,
                        images: [item.productImg]
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });
        console.log("lineItems:", lineItems);
        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${DOMAIN}/success`,
            cancel_url: `${DOMAIN}/cancel`,
            line_items: lineItems,
            billing_address_collection: "required",
        });
        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating Stripe session:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.listen(8080, () => {
    console.log("listening on port 8080");
});
