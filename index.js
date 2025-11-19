import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import nodemailer from 'nodemailer';
import userRoutes from './routes/user.routes.js';
import usermodels from './models/user.models.js';
import cors from 'cors';
import session from 'express-session';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!MONGO_URI) {
	console.error('Missing MONGO_URI in environment. Set it in your .env file.');
	process.exit(1);
}
if (!EMAIL_USER || !EMAIL_PASS) {
	console.warn('EMAIL_USER or EMAIL_PASS not set. Nodemailer will not be able to send emails until these are configured.');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
	origin: 'http://localhost:5173',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	credentials: true
}));

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");

app.use(session({
	secret: process.env.SESSION_SECRET || 'your_secret_key', // move secret to .env
	resave: false,
	saveUninitialized: false, // prevents empty sessions
	cookie: {
		secure: false,   // true only if using HTTPS
		httpOnly: true,  // prevents JS access to cookie
		sameSite: 'lax'
	}
}));



app.use('/user', userRoutes);

console.log("MONGO_URI from .env:", MONGO_URI);

let transporter;
mongoose.connect(MONGO_URI)
	.then( async() => {
		console.log("Connected to MongoDB");
		if (EMAIL_USER && EMAIL_PASS) {
			transporter = nodemailer.createTransport({
				host: 'smtp.gmail.com',
				port: 587,
				secure: false,
				auth: {
					user: EMAIL_USER,
					pass: EMAIL_PASS,
				},
				tls: {
					rejectUnauthorized: false
				}
			});

			transporter.verify()
				.then(() => console.log('Nodemailer connection verified'))
				.catch(err => console.error('Nodemailer verification failed:', err));
		}

		app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
	})
	.catch((err) => {
		console.error("Failed to connect to MongoDB:", err);
		process.exit(1);
	});

export { transporter };
