const db=require("../db");

// CREATE EVENT

exports.createEvent =
async(req,res)=>{

try{

const {
organization_id,
title,
description,
location,
category,
start_datetime,
end_datetime
}=req.body;

if(
!organization_id ||
!title ||
!start_datetime ||
!end_datetime
){

return res.status(400).json({
error:"Missing required fields"
});

}

const [membership]=
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

if(membership.length===0){

return res.status(403).json({
error:"Access denied"
});

}

await db.query(
`
INSERT INTO events(
organization_id,
title,
description,
location,
category,
start_datetime,
end_datetime,
status,
created_by
)
VALUES(
?,?,?,?,?,?,?,
'pending',
?
)
`,
[
organization_id,
title,
description,
location,
category,
start_datetime,
end_datetime,
req.user.user_id
]
);

res.json({
message:"Event submitted"
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Event creation failed"
});

}

};

// GET APPROVED EVENTS

exports.getEvents =
async(req,res)=>{

try{

const [events]=
await db.query(
`
SELECT
events.event_id,
events.title,
events.description,
events.location,
events.start_datetime,
events.end_datetime,
events.category,
events.status,

organizations.name AS organization_name,

COUNT(event_registrations.registration_id)
AS registration_count

FROM events

LEFT JOIN organizations
ON organizations.organization_id=
events.organization_id

LEFT JOIN event_registrations
ON event_registrations.event_id=
events.event_id
AND event_registrations.status='registered'

WHERE events.status='approved'

GROUP BY
events.event_id,
events.title,
events.description,
events.location,
events.start_datetime,
events.end_datetime,
events.category,
events.status,
organizations.name

ORDER BY events.start_datetime ASC
`
);

res.json(events);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching events"
});

}

};

// GET EVENT DETAILS

exports.getEventDetails =
async(req,res)=>{

try{

const eventId =
req.params.id;

const [[event]] =
await db.query(
`
SELECT
events.*,

organizations.organization_id,
organizations.name AS organization_name,
organizations.category AS organization_category,
organizations.contact_email,
organizations.location AS organization_location,

users.first_name,
users.last_name,
users.email AS creator_email,

COUNT(event_registrations.registration_id)
AS registration_count

FROM events

LEFT JOIN organizations
ON organizations.organization_id=
events.organization_id

LEFT JOIN users
ON users.user_id=
events.created_by

LEFT JOIN event_registrations
ON event_registrations.event_id=
events.event_id
AND event_registrations.status='registered'

WHERE events.event_id=?

GROUP BY events.event_id
`,
[
eventId
]
);

if(!event){

return res.status(404).json({
error:"Event not found"
});

}

res.json(event);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching event"
});

}

};

// REGISTER EVENT

exports.registerEvent =
async(req,res)=>{

try{

const eventId=
req.params.id;

const userId=
req.user.user_id;

const [eventRows]=
await db.query(
`
SELECT *
FROM events
WHERE event_id=?
AND status='approved'
`,
[
eventId
]
);

if(eventRows.length===0){

return res.status(404).json({
error:"Event not found or not approved"
});

}

const eventData=
eventRows[0];

if(eventData.created_by === userId){

return res.status(400).json({
error:"You cannot register for your own event"
});

}

const [officerCheck] =
await db.query(
`
SELECT *
FROM organization_members
WHERE organization_id=?
AND user_id=?
AND organization_role IN(
'president',
'vice_president',
'secretary',
'treasurer',
'officer'
)
`,
[
eventData.organization_id,
userId
]
);

if(officerCheck.length>0){

return res.status(400).json({
error:"Organization officers cannot register for their own organization event"
});

}

const now=
new Date();

const start=
new Date(eventData.start_datetime);

if(now>=start){

return res.status(400).json({
error:"Registration closed"
});

}

const [existing]=
await db.query(
`
SELECT *
FROM event_registrations
WHERE event_id=?
AND user_id=?
AND status='registered'
`,
[
eventId,
userId
]
);

if(existing.length>0){

return res.status(400).json({
error:"Already registered"
});

}

const [cancelled]=
await db.query(
`
SELECT *
FROM event_registrations
WHERE event_id=?
AND user_id=?
AND status='cancelled'
`,
[
eventId,
userId
]
);

if(cancelled.length>0){

await db.query(
`
UPDATE event_registrations
SET status='registered',
registered_at=CURRENT_TIMESTAMP
WHERE event_id=?
AND user_id=?
`,
[
eventId,
userId
]
);

return res.json({
message:"Event registration successful"
});

}

await db.query(
`
INSERT INTO event_registrations
(
event_id,
user_id,
status
)
VALUES
(
?,?, 'registered'
)
`,
[
eventId,
userId
]
);

res.json({
message:"Event registration successful"
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Registration failed"
});

}

};

// CANCEL REGISTRATION

exports.cancelRegistration =
async(req,res)=>{

try{

const eventId=
req.params.id;

const userId=
req.user.user_id;

const [result]=
await db.query(
`
UPDATE event_registrations
SET status='cancelled'
WHERE event_id=?
AND user_id=?
AND status='registered'
`,
[
eventId,
userId
]
);

if(result.affectedRows===0){

return res.status(404).json({
error:"Registration not found"
});

}

res.json({
message:"Registration cancelled"
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Cancellation failed"
});

}

};

// GET MY EVENTS

exports.getMyEvents =
async(req,res)=>{

try{

const [events]=
await db.query(
`
SELECT
events.event_id,
events.title,
events.description,
events.location,
events.start_datetime,
events.end_datetime,
events.category,

organizations.name AS organization_name,

event_registrations.registration_id,
event_registrations.registered_at

FROM event_registrations

JOIN events
ON events.event_id=
event_registrations.event_id

JOIN organizations
ON organizations.organization_id=
events.organization_id

WHERE event_registrations.user_id=?
AND event_registrations.status='registered'

ORDER BY events.start_datetime ASC
`,
[
req.user.user_id
]
);

res.json(events);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching my events"
});

}

};

// APPROVE EVENT

exports.approveEvent =
async(req,res)=>{

try{

const eventId=
req.params.id;

const [events] =
await db.query(
`
SELECT *
FROM events
WHERE event_id=?
`,
[
eventId
]
);

if(events.length===0){

return res.status(404).json({
error:"Event not found"
});

}

await db.query(
`
UPDATE events
SET status='approved'
WHERE event_id=?
`,
[
eventId
]
);

res.json({
message:"Event approved"
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Approval failed"
});

}

};

// REJECT EVENT

exports.rejectEvent =
async(req,res)=>{

try{

const eventId =
req.params.id;

const [events] =
await db.query(
`
SELECT *
FROM events
WHERE event_id=?
`,
[
eventId
]
);

if(events.length===0){

return res.status(404).json({
error:"Event not found"
});

}

await db.query(
`
UPDATE events
SET status='rejected'
WHERE event_id=?
`,
[
eventId
]
);

res.json({
message:"Event rejected"
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Event rejection failed"
});

}

};

// GET EVENT REQUESTS FOR ADMIN

exports.getEventRequests =
async(req,res)=>{

try{

const status =
req.query.status;

let query =
`
SELECT
events.event_id,
events.title,
events.description,
events.location,
events.start_datetime,
events.end_datetime,
events.category,
events.status,
events.created_at,
events.created_by,

organizations.name AS organization_name,

users.first_name,
users.last_name,
users.email

FROM events

LEFT JOIN organizations
ON organizations.organization_id =
events.organization_id

LEFT JOIN users
ON users.user_id =
events.created_by
`;

const values =
[];

if(status){

query +=
`
WHERE events.status=?
`;

values.push(status);

}

query +=
`
ORDER BY events.created_at DESC
`;

const [events] =
await db.query(
query,
values
);

res.json(events);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching event requests"
});

}

};

// GET EVENTS CREATED BY OFFICER'S ORGANIZATIONS

exports.getMyOrganizationEvents =
async(req,res)=>{

try{

const [events]=
await db.query(
`
SELECT
events.event_id,
events.organization_id,
events.title,
events.status,
events.start_datetime,
events.created_at,

organizations.name AS organization_name,

COUNT(event_registrations.registration_id)
AS registration_count

FROM events

JOIN organizations
ON organizations.organization_id =
events.organization_id

JOIN organization_members
ON organization_members.organization_id =
events.organization_id

LEFT JOIN event_registrations
ON event_registrations.event_id =
events.event_id
AND event_registrations.status='registered'

WHERE organization_members.user_id=?

AND organization_members.organization_role IN(
'president',
'vice_president',
'secretary',
'treasurer',
'officer'
)

GROUP BY
events.event_id,
events.organization_id,
events.title,
events.status,
events.start_datetime,
events.created_at,
organizations.name

ORDER BY events.created_at DESC
`,
[
req.user.user_id
]
);

res.json(events);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching organization events"
});

}

};

// GET EVENT REGISTRATIONS

exports.getEventRegistrations =
async(req,res)=>{

try{

const eventId=
req.params.id;

const [permission]=
await db.query(
`
SELECT *
FROM organization_members

JOIN events
ON events.organization_id=
organization_members.organization_id

WHERE events.event_id=?
AND organization_members.user_id=?
AND organization_members.organization_role IN(
'president',
'vice_president',
'secretary',
'treasurer',
'officer'
)
`,
[
eventId,
req.user.user_id
]
);

if(permission.length===0){

return res.status(403).json({
error:"Access denied"
});

}

const [registrations]=
await db.query(
`
SELECT
event_registrations.registration_id,
event_registrations.attendance_status,
event_registrations.attendance_marked_at,
event_registrations.attendance_marked_by,

users.user_id,
users.first_name,
users.last_name,
users.email,

event_registrations.registered_at

FROM event_registrations

JOIN users
ON users.user_id=
event_registrations.user_id

WHERE event_registrations.event_id=?
AND event_registrations.status='registered'

ORDER BY event_registrations.registered_at ASC
`,
[
eventId
]
);

res.json(registrations);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching registrations"
});

}

};

// MARK ATTENDANCE

exports.markAttendance =
async(req,res)=>{

try{

const registrationId =
req.params.id;

const {
attendance_status
}=req.body;

const allowedStatuses =
[
"present",
"absent",
"not_marked"
];

if(!allowedStatuses.includes(attendance_status)){

return res.status(400).json({
error:"Invalid attendance status"
});

}

const [rows] =
await db.query(
`
SELECT
event_registrations.registration_id,
event_registrations.event_id,
event_registrations.user_id,
events.organization_id
FROM event_registrations

JOIN events
ON events.event_id =
event_registrations.event_id

WHERE event_registrations.registration_id=?
`,
[
registrationId
]
);

if(rows.length===0){

return res.status(404).json({
error:"Registration not found"
});

}

const registration =
rows[0];

if(registration.user_id === req.user.user_id){

return res.status(403).json({
error:"You cannot mark your own attendance"
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
'vice_president',
'secretary'
)
`,
[
registration.organization_id,
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
UPDATE event_registrations
SET
attendance_status=?,
attendance_marked_at=CURRENT_TIMESTAMP,
attendance_marked_by=?
WHERE registration_id=?
`,
[
attendance_status,
req.user.user_id,
registrationId
]
);

res.json({
message:"Attendance updated"
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed marking attendance"
});

}

};

// GET ATTENDANCE SUMMARY

exports.getAttendanceSummary =
async(req,res)=>{

try{

const eventId =
req.params.id;

const [permission] =
await db.query(
`
SELECT *
FROM organization_members

JOIN events
ON events.organization_id =
organization_members.organization_id

WHERE events.event_id=?
AND organization_members.user_id=?
AND organization_members.organization_role IN(
'president',
'vice_president',
'secretary'
)
`,
[
eventId,
req.user.user_id
]
);

if(permission.length===0){

return res.status(403).json({
error:"Access denied"
});

}

const [[summary]] =
await db.query(
`
SELECT
COUNT(*) AS registered,
SUM(attendance_status='present') AS present,
SUM(attendance_status='absent') AS absent,
SUM(attendance_status='not_marked') AS not_marked
FROM event_registrations
WHERE event_id=?
AND status='registered'
`,
[
eventId
]
);

res.json(summary);

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed loading attendance summary"
});

}

};

// GET MY ATTENDANCE RATE

exports.getMyAttendanceRate =
async(req,res)=>{

try{

const userId =
req.user.user_id;

const [[stats]] =
await db.query(
`
SELECT
SUM(
CASE
WHEN attendance_status='present'
THEN 1 ELSE 0
END
) AS present_count,

SUM(
CASE
WHEN attendance_status='absent'
THEN 1 ELSE 0
END
) AS absent_count

FROM event_registrations

WHERE user_id=?
AND status='registered'
`,
[
userId
]
);

const present =
stats.present_count || 0;

const absent =
stats.absent_count || 0;

const total =
present + absent;

const attendance_rate =
total === 0
?
0
:
Math.round(
(present / total) * 100
);

res.json({
present_count:present,
absent_count:absent,
attendance_rate
});

}
catch(error){

console.log(error);

res.status(500).json({
error:"Failed fetching attendance rate"
});

}

};