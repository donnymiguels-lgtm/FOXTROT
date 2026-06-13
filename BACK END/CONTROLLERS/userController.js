const db =
require("../db");

exports.getUsers =
async(req,res)=>{

try{

const [users] =
await db.query(
`
SELECT
user_id,
first_name,
last_name,
email,
system_role,
created_at
FROM users
ORDER BY created_at DESC
`
);

res.json(users);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching users"
});

}

};

exports.updateUserRole =
async(req,res)=>{

try{

const userId =
req.params.id;

const {
system_role
}=req.body;

const allowedRoles =
[
"student",
"admin"
];

if(!allowedRoles.includes(system_role)){

return res.status(400).json({
error:"Invalid role"
});

}

const [result] =
await db.query(
`
UPDATE users
SET system_role=?
WHERE user_id=?
`,
[
system_role,
userId
]
);

if(result.affectedRows===0){

return res.status(404).json({
error:"User not found"
});

}

res.json({
message:"Role updated"
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed updating role"
});

}

};