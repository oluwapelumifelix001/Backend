import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import path from 'path';
const app = express();
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs")



const MONGO_URI = process.env.MONGO_URI ;
const PORT = process.env.PORT 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const UserSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: [true, "Name is required"]
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true,
        
    }
}
)
const User = mongoose.model("User", UserSchema)



console.log("MONGO_URI from .env:");
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("connected  to mongodb")
    })
    .catch((err) => {
        console.log("err" + err)
    })


app.get("/musicApi", (req, res) => {
    res.send(musicApi)
})

app.get("/Signup", (req, res) => {
    res.render("Signup")
})
app.post('/signup', async (req, res) => {
    try {
        const { Name, Email, Password } = req.body;
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordRegex.test(Password)) {
            return res.render("Signup", { error: "Password must include uppercase, lowercase, number, special character, and be at least 8 characters long." });
        }

        const existingUser = await User.findOne({ Email });
        if (existingUser) {
            return res.render("Signup", { error: "Email already registered." });
        }
        const hashedPassword = await bcrypt.hash(Password, 10);
        const newUser = new User({ Name, Email, Password: hashedPassword });
        await newUser.save();

        console.log("User saved:", newUser);
        res.redirect("/Login");
    } catch (error) {
        console.error("Error during signup:", error);
        res.render("Signup", { error: "Something went wrong, please try again." });
    }
});

app.get('/Login', (req, res) => {
    res.render("Login")
})
app.get('/dashboard', (req, res) => {
    res.render("dashboard")
})
app.post("/Login", async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const Check = await User.findOne({ Email })

        if (!Check) {
            return res.render("Login",{ error: "Invalid Email" })
        }
        const validPassword = await bcrypt.compare(Password, Check.Password)
        if (!validPassword) {
            console.log('Invalid Password')
            return res.render("Login", { error: "Invalid Password" });
        }
        res.redirect("dashboard")

    }
    catch (error) {
        console.error("Login error:", error);
        console.error("Login error:", error);
        return res.render("Login", { error: "Something went wrong" });
    }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));