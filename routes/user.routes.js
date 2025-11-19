import express from 'express';
import { PostSignup, PostLogin, getDashboard, Logout } from '../controllers/user.controllers.js';


const router = express.Router();


router.post('/signup', PostSignup);
router.post('/login', PostLogin);

// Dashboard (protected)
// router.get('/dashboard', requireLogin, getDashboard);


router.get('/dashboard', getDashboard);
router.get('/logout', Logout);

export default router;


































// import express from 'express';
// import { getSignup, PostSignup, getLogin, PostLogin, getdashboard } from '../controllers/user.controllers.js';

// const router = express.Router();

// router.get("/Signup", getSignup);
// router.post("/Signup", PostSignup);

// router.get("/Login", getLogin);
// router.post("/Login", PostLogin);

// router.get("/dashboard", getdashboard);

// export default router;

