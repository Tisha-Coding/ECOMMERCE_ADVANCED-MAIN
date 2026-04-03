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

// ✅ Final CORS Configuration (Frontend + Admin dono ke liye)
app.use(cors({
    origin: [
        "http://localhost:5173",                          // Local Frontend
        "http://localhost:5174",                          // Local Admin
        "https://ecommerce-frontend-1j1s.onrender.com",   // Live Frontend
        "https://ecommerce-admin-hl5r.onrender.com",      // Live Admin
        process.env.FRONTEND_URL || "",                   // Render env variable
        process.env.ADMIN_URL || ""                       // Render env variable
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

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