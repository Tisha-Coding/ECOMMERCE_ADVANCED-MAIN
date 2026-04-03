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

// middlewares
// middlewares
app.use(express.json());

// Updated CORS
app.use(cors({
    origin: [
        'http://localhost:5173',           // local frontend
        'http://localhost:5174',           // local admin (agar hai)
        process.env.FRONTEND_URL,          // Render frontend URL
        "https://ecommerce-backend-vok2.onrender.com"  // apna backend (optional)
    ],
    credentials: true
}));

// chat route
app.use("/api/chat", chatRoutes);

// api endpoints
app.use('/api/user', userRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);
app.use('/api/settings',settingsRouter);

app.get('/',(req,res) =>
{
    res.send("API Working");
})

app.listen(port, () => console.log("Server started on PORT : " + port));