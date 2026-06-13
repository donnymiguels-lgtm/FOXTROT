const db=require("../db");

async function isOrganizationPresident(
userId,
organizationId
){

const [rows] =
await db.query(
`
SELECT *
FROM organization_members
WHERE user_id=?
AND organization_id=?
AND organization_role='president'
`,
[
userId,
organizationId
]
);

return rows.length > 0;

}

async function isOrganizationOfficer(
userId,
organizationId
){

const [rows]=await db.query(
`
SELECT *
FROM organization_members
WHERE user_id=?
AND organization_id=?
AND organization_role IN(
'president',
'vice_president',
'secretary',
'treasurer',
'officer'
)
`,
[
userId,
organizationId
]
);

return rows.length>0;

}

// CREATE ORGANIZATION REQUEST
exports.createOrganization=async(req,res)=>{

try{

const{
name,
category,
description,
location,
contact_email
}=req.body;

await db.query(
`
INSERT INTO organization_requests
(
submitted_by,
organization_name,
category,
description,
location,
contact_email
)
VALUES
(
?,?,?,?,?,?
)
`,
[
req.user.user_id,
name,
category,
description,
location,
contact_email
]
);

res.json({
message:"Organization request submitted"
});

}

catch(error){

console.log(error);

res.status(500).json({
error:"Failed creating request"
});

}

};

// APPROVE ORGANIZATION REQUEST
exports.approveOrganization=async(req,res)=>{

try{

const requestId=req.params.id;

const [requests]=await db.query(
`
SELECT *
FROM organization_requests
WHERE request_id=?
`,
[requestId]
);

if(requests.length===0){

return res.status(404).json({
error:"Request not found"
});

}

const request=requests[0];

if(request.status==="approved"){

return res.status(400).json({
error:"Request already approved"
});

}

const [result]=await db.query(
`
INSERT INTO organizations
(
name,
category,
description,
location,
contact_email,
created_by
)
VALUES
(
?,?,?,?,?,?
)
`,
[
request.organization_name,
request.category,
request.description,
request.location,
request.contact_email,
request.submitted_by
]
);

await db.query(
`
INSERT INTO organization_members
(
organization_id,
user_id,
organization_role
)
VALUES
(
?,?, 'president'
)
`,
[
result.insertId,
request.submitted_by
]
);

await db.query(
`
UPDATE organization_requests
SET
status='approved',
reviewed_by=?
WHERE request_id=?
`,
[
req.user.user_id,
requestId
]
);

res.json({
message:"Organization approved"
});

}

catch(error){

console.log(error);

res.status(500).json({
error:"Approval failed"
});

}

};

//REJECT ORGANIZATION

exports.rejectOrganization =
async(req,res)=>{

try{

const requestId =
req.params.id;

const [requests] =
await db.query(
`
SELECT *
FROM organization_requests
WHERE request_id=?
`,
[
requestId
]
);

if(requests.length===0){

return res.status(404).json({
error:"Request not found"
});

}

const request =
requests[0];

if(request.status!=="pending"){

return res.status(400).json({
error:"Request already processed"
});

}

await db.query(
`
UPDATE organization_requests
SET
status='rejected',
reviewed_by=?
WHERE request_id=?
`,
[
req.user.user_id,
requestId
]
);

res.json({
message:"Organization rejected"
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Rejection failed"
});

}

};

// JOIN ORGANIZATION
exports.joinOrganization=async(req,res)=>{

try{

const organizationId=req.params.id;
const userId=req.user.user_id;

const [member]=await db.query(
`
SELECT *
FROM organization_members
WHERE organization_id=?
AND user_id=?
`,
[
organizationId,
userId
]
);

if(member.length>0){

return res.status(400).json({
error:"Already a member"
});

}

const [existing]=await db.query(
`
SELECT *
FROM membership_requests
WHERE organization_id=?
AND user_id=?
AND status='pending'
`,
[
organizationId,
userId
]
);

if(existing.length>0){

return res.status(400).json({
error:"Request already exists"
});

}

await db.query(
`
INSERT INTO membership_requests
(
organization_id,
user_id,
status
)
VALUES
(
?,?, 'pending'
)
`,
[
organizationId,
userId
]
);

res.json({
message:"Membership request submitted"
});

}

catch(error){

console.log(error);

res.status(500).json({
error:"Join failed"
});

}

};

// APPROVE MEMBERSHIP
exports.approveMembership=async(req,res)=>{

try{

const requestId=req.params.id;
const reviewerId=req.user.user_id;

const [requests]=await db.query(
`
SELECT *
FROM membership_requests
WHERE request_id=?
`,
[requestId]
);

if(requests.length===0){

return res.status(404).json({
error:"Request not found"
});

}

const request=requests[0];

if(request.status==="approved"){

return res.status(400).json({
error:"Already approved"
});

}

if(request.status==="rejected"){

return res.status(400).json({
error:"Request already rejected"
});

}

const isAdmin=req.user.role==="admin";

const isOfficer=await isOrganizationOfficer(
reviewerId,
request.organization_id
);

if(!isAdmin && !isOfficer){

return res.status(403).json({
error:"Access denied"
});

}

await db.query(
`
UPDATE membership_requests
SET
status='approved',
reviewed_by=?
WHERE request_id=?
`,
[
reviewerId,
requestId
]
);

const [existingMember]=await db.query(
`
SELECT *
FROM organization_members
WHERE organization_id=?
AND user_id=?
`,
[
request.organization_id,
request.user_id
]
);

if(existingMember.length===0){

await db.query(
`
INSERT INTO organization_members
(
organization_id,
user_id,
organization_role
)
VALUES
(
?,?, 'member'
)
`,
[
request.organization_id,
request.user_id
]
);

}

res.json({
message:"Membership approved"
});

}

catch(error){

console.log(error);

res.status(500).json({
error:"Approval failed"
});

}

};

// REJECT MEMBERSHIP
exports.rejectMembership=async(req,res)=>{

try{

const requestId=req.params.id;
const reviewerId=req.user.user_id;

const [requests]=await db.query(
`
SELECT *
FROM membership_requests
WHERE request_id=?
`,
[requestId]
);

if(requests.length===0){

return res.status(404).json({
error:"Request not found"
});

}

const request=requests[0];

if(request.status!=="pending"){

return res.status(400).json({
error:"Request already processed"
});

}

const isAdmin=req.user.role==="admin";

const isOfficer=await isOrganizationOfficer(
reviewerId,
request.organization_id
);

if(!isAdmin && !isOfficer){

return res.status(403).json({
error:"Access denied"
});

}

await db.query(
`
UPDATE membership_requests
SET
status='rejected',
reviewed_by=?
WHERE request_id=?
`,
[
reviewerId,
requestId
]
);

res.json({
message:"Membership rejected"
});

}

catch(error){

console.log(error);

res.status(500).json({
error:"Rejection failed"
});

}

};

// GET ORGANIZATIONS
exports.getOrganizations=async(req,res)=>{

try{

const [organizations]=await db.query(
`
SELECT

organizations.*,

COUNT(DISTINCT organization_members.membership_id)
AS member_count,

COUNT(DISTINCT events.event_id)
AS event_count,

COUNT(DISTINCT announcements.announcement_id)
AS announcement_count

FROM organizations

LEFT JOIN organization_members
ON organization_members.organization_id =
organizations.organization_id

LEFT JOIN events
ON events.organization_id =
organizations.organization_id

LEFT JOIN announcements
ON announcements.organization_id =
organizations.organization_id

WHERE organizations.status='active'

GROUP BY
organizations.organization_id

ORDER BY organizations.created_at DESC
`
);

res.json(organizations);

}

catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching organizations"
});

}

};

exports.getOrganizationDetails =
async(req,res)=>{

try{

const organizationId =
req.params.id;

const [[organization]] =
await db.query(
`
SELECT

organizations.*,

COUNT(DISTINCT organization_members.membership_id)
AS member_count,

COUNT(DISTINCT events.event_id)
AS event_count,

COUNT(DISTINCT announcements.announcement_id)
AS announcement_count

FROM organizations

LEFT JOIN organization_members
ON organization_members.organization_id =
organizations.organization_id

LEFT JOIN events
ON events.organization_id =
organizations.organization_id

LEFT JOIN announcements
ON announcements.organization_id =
organizations.organization_id

WHERE organizations.organization_id=?
AND organizations.status='active'

GROUP BY organizations.organization_id
`,
[
organizationId
]
);

if(!organization){

return res.status(404).json({
error:"Organization not found"
});

}

const [events] =
await db.query(
`
SELECT
event_id,
title,
description,
location,
start_datetime,
end_datetime,
category
FROM events
WHERE organization_id=?
AND status='approved'
ORDER BY start_datetime ASC
LIMIT 5
`,
[
organizationId
]
);

const [announcements] =
await db.query(
`
SELECT
announcements.announcement_id,
announcements.title,
announcements.content,
announcements.created_at,

users.first_name,
users.last_name

FROM announcements

JOIN users
ON users.user_id =
announcements.created_by

WHERE announcements.organization_id=?

ORDER BY announcements.created_at DESC

LIMIT 5
`,
[
organizationId
]
);

const [officers] =
await db.query(
`
SELECT

organization_members.organization_role,

users.first_name,
users.last_name,
users.email

FROM organization_members

JOIN users
ON users.user_id =
organization_members.user_id

WHERE organization_members.organization_id=?

AND organization_members.organization_role IN(
'president',
'vice_president',
'secretary',
'treasurer',
'officer'
)

ORDER BY
FIELD(
organization_members.organization_role,
'president',
'vice_president',
'secretary',
'treasurer',
'officer'
)
`,
[
organizationId
]
);

res.json({
organization,
officers,
events,
announcements
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching organization details"
});

}

};

// GET MY ORGANIZATIONS
exports.getMyOrganizations=async(req,res)=>{

try{

const [rows]=await db.query(
`
SELECT
organizations.organization_id,
organizations.name,
organizations.category,
organizations.created_at,
organization_members.organization_role,
organization_members.joined_at
FROM organization_members
JOIN organizations
ON organizations.organization_id=
organization_members.organization_id
WHERE organization_members.user_id=?
`,
[
req.user.user_id
]
);

res.json(rows);

}

catch(error){

console.log(error);

res.status(500).json({
error:"Failed"
});

}

};

// GET ORGANIZATION REQUESTS FOR ADMIN
exports.getOrganizationRequests =
async(req,res)=>{

try{

const status =
req.query.status;

let query =
`
SELECT

organization_requests.request_id,
organization_requests.organization_name,
organization_requests.category,
organization_requests.description,
organization_requests.location,
organization_requests.contact_email,
organization_requests.submitted_by,
organization_requests.status,
organization_requests.submitted_at,

users.first_name,
users.last_name,
users.email

FROM organization_requests

LEFT JOIN users
ON users.user_id =
organization_requests.submitted_by
`;

const values =
[];

if(status){

query +=
`
WHERE organization_requests.status=?
`;

values.push(status);

}

query +=
`
ORDER BY organization_requests.submitted_at DESC
`;

const [rows] =
await db.query(
query,
values
);

res.json(rows);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching requests"
});

}

};

// OFFICER DASHBOARD
exports.getOfficerDashboard=async(req,res)=>{

try{

const organizationId=req.params.id;
const userId=req.user.user_id;

const allowed=await isOrganizationOfficer(
userId,
organizationId
);

if(!allowed){

return res.status(403).json({
error:"Access denied"
});

}

const [[attendanceStats]] =
await db.query(

`
SELECT

SUM(
CASE
WHEN attendance_status='present'
THEN 1
ELSE 0
END
)
AS present_count,

SUM(
CASE
WHEN attendance_status='absent'
THEN 1
ELSE 0
END
)
AS absent_count

FROM event_registrations

JOIN events
ON events.event_id =
event_registrations.event_id

WHERE events.organization_id=?
`,
[
organizationId
]
);

const [roleStats] =
await db.query(
`
SELECT
organization_role,
COUNT(*) AS total
FROM organization_members
WHERE organization_id=?
GROUP BY organization_role
`,
[
organizationId
]
);

const [[dashboard]]=await db.query(
`
SELECT
organizations.organization_id,
organizations.name,
organization_members.organization_role,

COUNT(DISTINCT members.user_id)
AS total_members,

COUNT(DISTINCT events.event_id)
AS total_events,

COUNT(DISTINCT membership_requests.request_id)
AS pending_requests

FROM organizations

JOIN organization_members
ON organization_members.organization_id=
organizations.organization_id
AND organization_members.user_id=?

LEFT JOIN organization_members AS members
ON members.organization_id=
organizations.organization_id

LEFT JOIN events
ON events.organization_id=
organizations.organization_id

LEFT JOIN membership_requests
ON membership_requests.organization_id=
organizations.organization_id
AND membership_requests.status='pending'

WHERE organizations.organization_id=?

GROUP BY
organizations.organization_id,
organizations.name,
organization_members.organization_role
`,
[
userId,
organizationId
]
);

const present =
attendanceStats.present_count || 0;

const absent =
attendanceStats.absent_count || 0;

const totalMarked =
present + absent;

dashboard.present_count =
present;

dashboard.absent_count =
absent;

dashboard.attendance_rate =
totalMarked === 0
?
0
:
Math.round(
(present / totalMarked) * 100
);

dashboard.role_stats =
{
president:0,
vice_president:0,
secretary:0,
treasurer:0,
officer:0,
member:0
};

roleStats.forEach(row=>{

dashboard.role_stats[row.organization_role] =
row.total;

});

res.json(dashboard);

}

catch(error){

console.log(error);

res.status(500).json({
error:"Failed loading officer dashboard"
});

}

};

// GET MEMBERSHIP REQUESTS
exports.getMembershipRequests=async(req,res)=>{

try{

const organizationId=req.params.id;
const userId=req.user.user_id;

const allowed=await isOrganizationOfficer(
userId,
organizationId
);

if(!allowed){

return res.status(403).json({
error:"Access denied"
});

}

const [rows]=await db.query(
`
SELECT
membership_requests.request_id,
membership_requests.status,
membership_requests.created_at,
users.first_name,
users.last_name,
users.email
FROM membership_requests
JOIN users
ON users.user_id=
membership_requests.user_id
WHERE membership_requests.organization_id=?
AND membership_requests.status='pending'
ORDER BY membership_requests.created_at DESC
`,
[
organizationId
]
);

res.json(rows);

}

catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching membership requests"
});

}

};

// GET ORGANIZATION MEMBERS

exports.getOrganizationMembers =
async(req,res)=>{

try{

const organizationId =
req.params.id;

const userId =
req.user.user_id;

const allowed =
await isOrganizationOfficer(
userId,
organizationId
);

if(!allowed){

return res.status(403).json({
error:"Access denied"
});

}

const [members] =
await db.query(
`
SELECT
organization_members.membership_id,
organization_members.organization_id,
organization_members.user_id,
organization_members.organization_role,
organization_members.joined_at,

users.first_name,
users.last_name,
users.email

FROM organization_members

JOIN users
ON users.user_id =
organization_members.user_id

WHERE organization_members.organization_id=?

ORDER BY
FIELD(
organization_members.organization_role,
'president',
'vice_president',
'secretary',
'treasurer',
'officer',
'member'
),
users.last_name ASC
`,
[
organizationId
]
);

res.json(members);

}

catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching members"
});

}

};

// UPDATE MEMBER ROLE

exports.updateMemberRole =
async(req,res)=>{

try{

const membershipId =
req.params.id;

const {
organization_role
}=req.body;

const allowedRoles = [
"vice_president",
"secretary",
"treasurer",
"officer",
"member"
];

if(!allowedRoles.includes(organization_role)){

return res.status(400).json({
error:"Invalid role"
});

}

const [memberships] =
await db.query(
`
SELECT *
FROM organization_members
WHERE membership_id=?
`,
[
membershipId
]
);

if(memberships.length===0){

return res.status(404).json({
error:"Membership not found"
});

}

const membership =
memberships[0];

const allowed =
await isOrganizationPresident(
req.user.user_id,
membership.organization_id
);

if(!allowed){

return res.status(403).json({
error:"Access denied"
});

}

if(membership.organization_role==="president"){

return res.status(400).json({
error:"President role cannot be changed here"
});

}

if(
membership.user_id ===
req.user.user_id
){

return res.status(400).json({
error:"You cannot change your own role"
});

}

await db.query(
`
UPDATE organization_members
SET organization_role=?
WHERE membership_id=?
`,
[
organization_role,
membershipId
]
);

res.json({
message:"Member role updated"
});

}

catch(error){

console.log(error);

res.status(500).json({
error:"Failed updating role"
});

}

};

// REMOVE MEMBER

exports.removeMember =
async(req,res)=>{


try{

const membershipId =
req.params.id;

const [memberships] =
await db.query(
`
SELECT *
FROM organization_members
WHERE membership_id=?
`,
[
membershipId
]
);

if(memberships.length===0){

return res.status(404).json({
error:"Membership not found"
});

}

const membership =
memberships[0];

const allowed =
await isOrganizationPresident(
req.user.user_id,
membership.organization_id
);

if(!allowed){

return res.status(403).json({
error:"Access denied"
});

}

if(membership.organization_role==="president"){

return res.status(400).json({
error:"President cannot be removed here"
});

}

if(
membership.user_id ===
req.user.user_id
){

return res.status(400).json({
error:"You cannot remove yourself"
});

}

await db.query(
`
DELETE FROM organization_members
WHERE membership_id=?
`,
[
membershipId
]
);

res.json({
message:"Member removed"
});

}

catch(error){

console.log(error);

res.status(500).json({
error:"Failed removing member"
});

}

};

exports.transferPresident =
async(req,res)=>{

try{

const membershipId =
req.params.id;

const [memberships] =
await db.query(
`
SELECT *
FROM organization_members
WHERE membership_id=?
`,
[
membershipId
]
);

if(memberships.length===0){

return res.status(404).json({
error:"Membership not found"
});

}

const targetMember =
memberships[0];

const organizationId =
targetMember.organization_id;

const allowed =
await isOrganizationPresident(
req.user.user_id,
organizationId
);

if(!allowed){

return res.status(403).json({
error:"Only the current president can transfer presidency"
});

}

if(
targetMember.organization_role ===
"president"
){

return res.status(400).json({
error:"This member is already president"
});

}

const [currentPresidentRows] =
await db.query(
`
SELECT *
FROM organization_members
WHERE organization_id=?
AND organization_role='president'
`,
[
organizationId
]
);

if(currentPresidentRows.length===0){

return res.status(400).json({
error:"Current president not found"
});

}

const currentPresident =
currentPresidentRows[0];

await db.query(
`
UPDATE organization_members
SET organization_role='member'
WHERE membership_id=?
`,
[
currentPresident.membership_id
]
);

await db.query(
`
UPDATE organization_members
SET organization_role='president'
WHERE membership_id=?
`,
[
membershipId
]
);

res.json({
message:"Presidency transferred successfully"
});

}

catch(error){

console.log(error);

res.status(500).json({
error:"Transfer failed"
});

}

};

exports.getMyMembershipRequests =
async(req,res)=>{

try{

const [rows] =
await db.query(
`
SELECT
request_id,
organization_id,
status,
created_at
FROM membership_requests
WHERE user_id=?
AND status='pending'
`,
[
req.user.user_id
]
);

res.json(rows);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching membership requests"
});

}

};

exports.leaveOrganization =
async(req,res)=>{

try{

const organizationId =
req.params.id;

const userId =
req.user.user_id;

const [membershipRows] =
await db.query(
`
SELECT *
FROM organization_members
WHERE organization_id=?
AND user_id=?
`,
[
organizationId,
userId
]
);

if(membershipRows.length===0){

return res.status(404).json({
error:"You are not a member of this organization"
});

}

const membership =
membershipRows[0];

if(membership.organization_role==="president"){

return res.status(400).json({
error:"President must transfer presidency before leaving"
});

}

await db.query(
`
DELETE FROM organization_members
WHERE organization_id=?
AND user_id=?
`,
[
organizationId,
userId
]
);

res.json({
message:"You left the organization"
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed leaving organization"
});

}

};