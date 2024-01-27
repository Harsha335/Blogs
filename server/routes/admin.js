const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');   //bcrypt password to store in database
const jwt = require('jsonwebtoken');


const adminLayout = "../views/layouts/admin";   // custom layout
const jwtSecret = process.env.JWT_SECRET;


/** Check login middle-ware */
const authMiddleWare = (req,res,next)=> {
    const token = req.cookies.token;
    if(!token){
        res.status(401).json({message : "Unauthorized"});
    }
    
    try{
        const decoded = jwt.verify(token, jwtSecret); //check secret
        req.userId  = decoded.userId;
        next();
    }
    catch(error){
        res.status(401).json({message : "Unauthorized"});
    }
}

/** GET-Admin login page */
router.get('/admin',(req,res)=>{
    try{
        const locals = {
            title : "Admin",
            description : "Simple Blog created with Nodejs, Express, & MongoDb"
        }
        res.render('admin/index',{locals, layout: adminLayout});
    }
    catch(error){
        console.log(error);
    }
});

/** POST - Admin check login */
router.post('/admin',async (req,res)=>{
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if(!user){
            return res.status(401).json({ message : "Invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({ message : "Invalid credentials"});
        }

        const token = jwt.sign({ userId: user._id}, jwtSecret);
        // console.log(token);
        res.cookie('token', token, {httpOnly: true});
        res.redirect('/dashboard');
    }
    catch(error){
        console.log(error);
    }
});

router.get("/dashboard", authMiddleWare, async (req,res)=>{   //protected page by authMiddlware
    try {
        const locals={
            title: "dashboard",
            description: "Simple Blog created with NodeJs, Express & MongoDb"
        };
        const data = await Post.find();
        res.render("admin/dashboard",{
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

/** GET Admin - add new post */
router.get("/add-post", authMiddleWare, async (req,res)=>{   //protected page by authMiddlware
    try {
        const locals={
            title: "Add Post",
            description: "Simple Blog created with NodeJs, Express & MongoDb"
        };
        res.render("admin/add-post",{
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

/** POST Admin - add new post */
router.post("/add-post", authMiddleWare, async (req,res)=>{   //protected page by authMiddlware
    try {
        try{
            const newPost = new Post(req.body);
            await newPost.save();   // OR await Post.create(newPost);
            res.redirect("/dashboard");
        }
        catch(error){
            console.log(error);
        }

    } catch (error) {
        console.log(error);
    }
});

/** GET Admin - update post */
router.get("/edit-post/:id", authMiddleWare, async (req,res)=>{   //protected page by authMiddlware
    try {
        const locals={
            title: "Edit post",
            description: "Simple Blog created with NodeJs, Express & MongoDb"
        };
        const data = await Post.findOne({_id: req.params.id});

        res.render("admin/edit-post",{
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

/** PUT Admin - update post */
router.put("/edit-post/:id", authMiddleWare, async (req,res)=>{   //protected page by authMiddlware
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            ... req.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.log(error);
    }
});

/** DELETE - Admin delete */
router.delete("/delete-post/:id", authMiddleWare, async (req,res)=>{
    try{
        await Post.findByIdAndDelete(req.params.id);
        res.redirect("/dashboard");
    }
    catch(error){
        console.log(error);
    }
});

/** GET - Admin logout */
router.get("/logout", authMiddleWare, async (req,res)=>{
    res.clearCookie("token");
    // res.json({message: " Logout Successfull"});
    res.redirect("/");
});

/** POST - Admin register */
// router.post('/register',async (req,res)=>{
//     try{
//         const {username, password} = req.body;
//         const hashedPassword = await bcrypt.hash(password, 10);//10- salt round used for encryption of data
//         try {
//             const user = await User.create({
//                 username,                           //USER - admin , PASSWORD - admin@123
//                 password: hashedPassword
//             });
//             res.status(201).json({ message: 'User Created', user});
//         } catch (error) {
//             if(error == 11000)
//             {
//                 res.status(409).json({ message: "User already in use"});
//             }
//             res.status(500).json({message: "Internal server error"});
//         }
//         res.render('admin/index',{locals, layout: adminLayout});
//     }
//     catch(error){
//         console.log(error);
//     }
// });




module.exports = router;