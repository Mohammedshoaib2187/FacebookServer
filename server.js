const express=require("express");
const mongodb=require("mongodb");
const mongoclient=mongodb.MongoClient;
const url="mongodb+srv://shoaib:shoaib123@cluster0.p6yw7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const app=express();
const cors=require("cors")
const bcryptjs=require("bcryptjs");
const multer=require("multer");
var path = require("path");
var router = express.Router();
const jwt = require("jsonwebtoken");
function authenticate(req, res, next) {
    // Check is the token is present in header
    if (req.headers.authorization) {
        // Check if the token is valid
        let valid = jwt.verify(req.headers.authorization, "}QF_w,(<u7BBt>V}");
        if (valid) {
            // if valid all next()
            req.userid = valid.id
            next();
        } else {
            res.status(401).json({
                message: "Unauthorized"
            })
        }
    } else {
        res.status(401).json({
            message: "Unauthorized"
        })
    }

}


app.use(express.json())
app.use(cors({
    origin : "*"
}))

// const storage = multer.diskStorage({
//     destination : (req,file,cb)=>{
//         cb(null,'uploads')
//     },
//     filename : (req,file,cb)=>{
//         cb(null,`file_${file.originalname}`)
//     }
// })

// var upload = multer ({storage:storage})

// var students =[]

app.post("/user-register",async function(req,res){
    try{
        let conn =await mongoclient.connect(url)

        let db = conn.db("Facebook")

        let salt = await bcryptjs.genSalt(10)

        let hash = await bcryptjs.hash(req.body.password,salt)

        req.body.password=hash;

        req.body.userid= parseInt(await db.collection("users").count())+1

        req.body.requests=[]

        req.body.friends=[]

        await db.collection("users").insertOne(req.body)

        await conn.close()
    }
    catch(err)
    {
        console.log(err)
    }

    res.json({
        message : "user added"
    })
})

app.post("/user-login",async function(req,res){
    try{
        let conn =await mongoclient.connect(url)

        let db = conn.db("Facebook")

        let user=await db.collection("users").findOne({email : req.body.email})

    
        if (user) {
            // Encrypt the given password with user doc password
            let result = await bcryptjs.compare(req.body.password, user.password);
            // Compare both password
            // if both are same
            if (result) {
                let user_id=user.userid
                console.log(user_id)
                // Generate JWT Token
                let token = jwt.sign({
                    id: user._id,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60)
                }, "}QF_w,(<u7BBt>V}")
                res
                    .status(200)
                    .json({
                        message: "Success",
                        token,
                        userid : user_id
                    })
            } else {
                res.status(401).json({
                    message: "Username/Password is worng"
                })
            }
            // loggin the user
        } else {
            res.status(401).json({
                message: "Username/Password is worng"
            })
        }

        await conn.close()
    }
    catch(err)
    {
        console.log(err)
    }

    
})

app.get("/all-users",async function(req,res){
    try{
        let conn =await mongoclient.connect(url)

        let db = conn.db("Facebook")

        let student=await db.collection("users").find({},{"_id":1,"username":1,"userid":1}).toArray()

        await conn.close()

        res.json(student)
    }
    catch(err)
    {
        console.log(err)
    }

    
})

app.post("/add-friend",authenticate,async function(req,res){
    try{
        let conn =await mongoclient.connect(url)

        let db = conn.db("Facebook")

        await db.collection("users").findOneAndUpdate({userid : req.body.userid },{$push : {friends : req.body.friendid}})

        await db.collection("users").findOneAndUpdate({userid : req.body.friendid },{$push : {friends : req.body.userid}})

        await conn.close()

        res.json({
            message:"success"
        })
    }
    catch(err)
    {
        console.log(err)
    }

    
})

app.post('/user-edit/:id',authenticate, async function(req, res) {
    try{
        var id= parseInt(req.params.id)
        let conn =await mongoclient.connect(url)

        let db = conn.db("Facebook")

        let temp=await db.collection("users").findOne({userid:id})

        req.body.userid=id

        req.body.friends=temp.friends

        await db.collection("users").findOneAndUpdate({userid:id},{ $set: req.body })

        await conn.close()

        res.json({
            message:"Success"
        })
    }
    catch(err)
    {
        console.log(err)
    }

});

app.get("/user/:id",authenticate,async function(req,res){
    try{
        var id= parseInt(req.params.id)
        let conn =await mongoclient.connect(url)

        let db = conn.db("Facebook")

        let student=await db.collection("users").find({userid:id},{"_id":1,"username":1,"userid":1}).toArray()

        await conn.close()

        res.json(student)
    }
    catch(err)
    {
        console.log(err)
    }

    
})

app.get("/one-user/:id",authenticate,async function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    try{
        var id= parseInt(req.params.id)
        let conn =await mongoclient.connect(url)

        let db = conn.db("Facebook")

        let student=await db.collection("users").find({userid:id},{"_id":1,"username":1,"userid":1}).toArray()

        await conn.close()

        res.json(student)
    }
    catch(err)
    {
        console.log(err)
    }

    
})

app.post("/post-insert",authenticate,async function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    try{
        let conn =await mongoclient.connect(url)

        let db = conn.db("Facebook")

        //req.body.userid= parseInt(await db.collection("users").count())+1

        await db.collection("posts").insertOne(req.body)

        await conn.close()
    }
    catch(err)
    {
        console.log(err)
    }

    res.json({
        message : "post added"
    })
})

app.get("/post-data",authenticate,async function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    try{
        let conn =await mongoclient.connect(url)

        let db = conn.db("Facebook")

        //req.body.userid= parseInt(await db.collection("users").count())+1

        let posts=await db.collection("posts").find().toArray()

        await conn.close()

        res.json(posts)
    }
    catch(err)
    {
        console.log(err)
    }

    res.json({
        message : "post added"
    })
})

app.post('/post-delete/:id',async function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    try{
        let conn =await mongoclient.connect(url)

        let db = conn.db("Facebook")


        await db.collection("posts").deleteOne({_id: mongodb.ObjectId(req.params.id)})

        await conn.close()

        res.json({
            message: "user deleted"
        })
    }
    catch(err)
    {
        console.log(err)
    }

});

app.listen(process.env.PORT || 3000,function(){
    console.log("Server is running")
})
