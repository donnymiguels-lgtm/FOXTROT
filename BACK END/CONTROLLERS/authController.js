const db = require("../db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");


// REGISTER

exports.registerUser = async (req,res)=>{

try{

const {

first_name,
last_name,
email,
password,
phone,
student_id

}=req.body;


const hashedPassword=
await bcrypt.hash(

password,

10

);


await db.query(

`

INSERT INTO users(

first_name,
last_name,
email,
password,
phone,
student_id,
system_role

)

VALUES(

?,?,?,?,?,?,?

)

`,

[

first_name,
last_name,
email,
hashedPassword,
phone,
student_id,
"student"

]

);

res.json({
message:"Registration successful"
});

}

catch(error){

console.log(error);

res.status(500).json({
error:"Registration failed"
});

}

};




// LOGIN

exports.loginUser = async(req,res)=>{

try{

const {
email,
password
}=req.body;


const [users]=await db.query(

`
SELECT *
FROM users
WHERE email=?
`,

[email]

);


if(users.length===0){

return res.status(401).json({
error:"Invalid credentials"
});

}


const user=users[0];


const validPassword=
await bcrypt.compare(
password,
user.password
);


if(!validPassword){

return res.status(401).json({
error:"Invalid credentials"
});

}


const token=
jwt.sign(

{

user_id:user.user_id,

role:user.system_role,

name:
`${user.first_name} ${user.last_name}`

},

process.env.JWT_SECRET,

{

expiresIn:"7d"

}

);


res.json({

message:"Login successful",

token,

user:{

user_id:user.user_id,

name:`${user.first_name} ${user.last_name}`,

role:user.system_role

}

});


}

catch(error){

console.log(error);

res.status(500).json({

error:"Login failed"

});

}

};