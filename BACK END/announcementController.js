const db =
require("../db");

// CREATE ANNOUNCEMENT

exports.createAnnouncement =
async(req,res)=>{

try{

const {
organization_id,
title,
content
}=req.body;

if(
!organization_id ||
!title ||
!content
){

return res.status(400).json({
error:"Missing required fields"
});

}

const [permission] =
await db.query(
`
SELECT *
FROM organization_members
WHERE organization_id=?
AND user_id=?
AND organization_role IN(
'president',
'vice_president'
)
`,
[
organization_id,
req.user.user_id
]
);

if(permission.length===0){

return res.status(403).json({
error:"Access denied"
});

}

await db.query(
`
INSERT INTO announcements
(
organization_id,
created_by,
title,
content
)
VALUES
(
?,?,?,?
)
`,
[
organization_id,
req.user.user_id,
title,
content
]
);

res.json({
message:"Announcement posted"
});

}

catch(error){

console.log(error);

res.status(500).json({
error:"Failed creating announcement"
});

}

};

// GET ANNOUNCEMENTS FOR MY ORGANIZATIONS

exports.getMyAnnouncements =
async(req,res)=>{

try{

const [announcements] =
await db.query(
`
SELECT

announcements.announcement_id,
announcements.title,
announcements.content,
announcements.created_at,

organizations.name AS organization_name,

users.first_name,
users.last_name

FROM announcements

JOIN organizations
ON organizations.organization_id =
announcements.organization_id

JOIN organization_members
ON organization_members.organization_id =
announcements.organization_id

JOIN users
ON users.user_id =
announcements.created_by

WHERE organization_members.user_id=?

ORDER BY announcements.created_at DESC
`,
[
req.user.user_id
]
);

res.json(announcements);

}

catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching announcements"
});

}

};