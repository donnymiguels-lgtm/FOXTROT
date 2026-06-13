USE orghub_db;

INSERT INTO users(
first_name,
last_name,
email,
password,
system_role
)

VALUES

(
'Admin',
'User',
'admin@orghub.com',
'password123',
'admin'
),

(
'Miguel',
'Student',
'miguel@email.com',
'password123',
'student'
);




SELECT * FROM users;




INSERT INTO organizations(

name,
category,
description,
location,
contact_email

)

VALUES(

'Tech Club',

'Technology',

'Coding Organization',

'Engineering Building',

'tech@email.com'

);


 <!-- Sample data finalized --> 

INSERT INTO organization_members(

organization_id,
user_id,
organization_role

)

VALUES(

1,
2,
'president'

);




SELECT *

FROM organization_members;




SELECT

u.first_name,
u.last_name,
o.name,
om.organization_role

FROM organization_members om

JOIN users u

ON om.user_id=u.user_id

JOIN organizations o

ON om.organization_id=o.organization_id;




