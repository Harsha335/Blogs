
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

/** GET - HOME */
router.get('', async (req,res)=>{
    try{
        const locals = {
            title : "home page ",
            description : "node js blog post "
        }

        let perPage = 10;
        let page = req.query.page || 1;

        const data = await Post.aggregate([ { $sort: { createdAt: -1 }}])
        .skip(perPage*page - perPage)
        .limit(perPage)
        .exec();
        
        const count = await Post.countDocuments({});   //total count of posts
        const nextPage = parseInt(page) + 1;
        const hasNextPage = (nextPage <= Math.ceil(count / perPage));
        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null
        });
    }
    catch(error){
        console.log(error);
    }
    
});

// function insertPostData () {
//     Post.insertMany([
//         {
//             title: "Building a Blog",
//             body: "This is the body text"
//         },
//         {
//             title: "Blog 2",
//             body: "Body of title 2"
//         }
//     ])
// }
// insertPostData();

/** GET - POST/:ID */
router.get('/post/:id', async (req,res) =>{
    try{
        let slug = req.params.id;
        const data = await Post.findById({ _id: slug});
        const locals = {
            title: data.title,
            description: "Simple Blog created with Nodejs, Express & MongoDb"
        }
        res.render('post', {locals,data});
    }
    catch(error)
    {
        console.log(error);
    }
});

/** POST - search */
router.post('/search', async (req,res)=>{
    try{
        const locals = {
            title: "search",
            description: "Simple Blog created with Nodejs, Express & MongoDb"
        }
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"");

        const data = await Post.find({
            $or : [
                { title: { $regex: new RegExp(searchNoSpecialChar,'i')}},
                { body: { $regex: new RegExp(searchNoSpecialChar,'i')}}
            ]
        });
        res.render('search', {locals,data}); 
    }
    catch(error)
    {
        console.log(error);
    }
});


router.get('/about', (req,res)=>{
    const locals = {
        title : "about Page",
        description : "About page ...."
    }
    res.render('about',locals); // one param - locals ; multiple - {data1,data2} OR {data1:xyz,data2:abc}
});

module.exports = router;