import express from 'express';
import cors from 'cors';
import 'dotenv/config';  // after this , we will get the support of .env file in our project
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import settingsRouter from './routes/settingsRoute.js';
import chatRoutes from "./routes/chatRoutes.js";

// App Config
const app = express();
const port = process.env.PORT || 4000
connectDB();
connectCloudinary();

// ================== MIDDLEWARES ==================
app.use(express.json());

// 🔥 Temporary Wildcard CORS (Testing ke liye) - Sab allow karega
app.use(cors({
    origin: true,                    // Sab origins allow
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.sendStatus(200);
});

// chat route
app.use("/api/chat", chatRoutes);

// api endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/settings', settingsRouter);

app.get('/', (req, res) => {
    res.send("API Working");
});

app.listen(port, () => console.log("Server started on PORT : " + port));