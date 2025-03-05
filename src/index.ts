import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from "dotenv";
import dbConnect from './Db/mongoConnect';
import errorHandler from './Middleware/errorHandler';
//import swaggerDocs from '../swagger1';
import swaggerDocs from './swagger';
import testRoutes from './Routes/test/testRoutes'
import userRoutes from './Routes/test/userRoutes'
import adminRoutes from './Routes/test/adminRoutes'
import categoryRoutes from './Routes/test/categoryRoutes'
import locationRoutes from './Routes/test/locationRoutes'
import productRoutes from './Routes/test/productRoutes'
import session from 'express-session';
import "./Helper/googleAuth"
dotenv.config();
const PORT: string = process.env.PORT || '4000';



const app = express();

app.use(express.json())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(bodyParser.json())
app.use(session({
    secret: 'nusart',  // Replace with a session secret
    resave: false,
    saveUninitialized: true,
  }));

dbConnect();

// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-requested-with'],
//     exposedHeaders: ['Authorization']
// }));

// Apply CORS middleware
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-requested-with'], // Allowed headers
    exposedHeaders: ['Authorization'] // Headers exposed to the client
}));

/**
 * @openapi

 * /deleteUserById/{id}:
 *   delete:
 *     summary: delete user by id.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: id of the user to be deleted.
 *     responses:
 *       200:
 *         description: user is deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedUser:
 *                   $ref: '#/components/schemas/AddUserRequestBody'
 *       401:
 *         description: No user found with the given ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errorobj:
 *                   type: object
 */
app.get("/",(req,res)=>{
    res.send("Home")
})

app.use(testRoutes);

//user routes
app.use(userRoutes);
app.use(categoryRoutes)
app.use(locationRoutes)
app.use(productRoutes)
app.use(adminRoutes)

app.use(errorHandler);

swaggerDocs(app)



app.listen(PORT,()=>{
    console.log(`app is started on http://localhost:${PORT}/`)
})
