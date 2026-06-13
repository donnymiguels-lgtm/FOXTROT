const express=require("express");

const router=express.Router();

const authController=
require("../controllers/authController");

const {

verifyToken

}=require(
"../middleware/authMiddleware"
);


router.post(
"/register",
authController.registerUser
);

router.post(
"/login",
authController.loginUser
);

router.get(

"/me",

verifyToken,

(req,res)=>{

res.json({

user_id:
req.user.user_id,

role:
req.user.role,

name:
req.user.name

});

}

);

module.exports=router;