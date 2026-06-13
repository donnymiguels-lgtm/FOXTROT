exports.register=
async(req,res)=>{

try{

const {

first_name,
last_name,
email,
password,
phone,
student_id

}=req.body;


const [existing]=
await db.query(

`

SELECT *

FROM users

WHERE email=?

`,

[email]

);


if(existing.length>0){

return res.status(400).json({

error:
"Email already exists"

});

}


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
role

)

VALUES(

?,?,?,?,?,?,
'student'

)

`,

[

first_name,
last_name,
email,
hashedPassword,
phone,
student_id

]

);


res.json({

message:
"Registration successful"

});

}

catch(error){

console.log(error);

res.status(500).json({

error:
"Registration failed"

});

}

};