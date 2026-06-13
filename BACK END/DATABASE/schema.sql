CREATE DATABASE orghub_db;

USE orghub_db;





CREATE TABLE users (

user_id INT AUTO_INCREMENT PRIMARY KEY,

first_name VARCHAR(100) NOT NULL,

last_name VARCHAR(100) NOT NULL,

email VARCHAR(255) UNIQUE NOT NULL,

password VARCHAR(255) NOT NULL,

system_role ENUM(
'student',
'admin'
) DEFAULT 'student',

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);




CREATE TABLE organization_requests (

request_id INT AUTO_INCREMENT PRIMARY KEY,

submitted_by INT NOT NULL,

organization_name VARCHAR(255) NOT NULL,

category VARCHAR(100),

description TEXT,

location VARCHAR(255),

contact_email VARCHAR(255),

status ENUM(
'pending',
'approved',
'rejected'
) DEFAULT 'pending',

reviewed_by INT,

submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (submitted_by)
REFERENCES users(user_id),

FOREIGN KEY (reviewed_by)
REFERENCES users(user_id)

);




CREATE TABLE organizations (

organization_id INT AUTO_INCREMENT PRIMARY KEY,

name VARCHAR(255) NOT NULL,

category VARCHAR(100),

description TEXT,

location VARCHAR(255),

contact_email VARCHAR(255),

status ENUM(
'active',
'inactive',
'suspended'
) DEFAULT 'active',

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);




CREATE TABLE organization_members (

membership_id INT AUTO_INCREMENT PRIMARY KEY,

organization_id INT NOT NULL,

user_id INT NOT NULL,

organization_role ENUM(

'president',

'vice_president',

'secretary',

'treasurer',

'officer',

'member'

) DEFAULT 'member',

joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (organization_id)
REFERENCES organizations(organization_id),

FOREIGN KEY (user_id)
REFERENCES users(user_id)

);




CREATE TABLE membership_requests (

request_id INT AUTO_INCREMENT PRIMARY KEY,

organization_id INT NOT NULL,

user_id INT NOT NULL,

status ENUM(

'pending',

'approved',

'rejected'

) DEFAULT 'pending',

reviewed_by INT,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (organization_id)
REFERENCES organizations(organization_id),

FOREIGN KEY (user_id)
REFERENCES users(user_id),

FOREIGN KEY (reviewed_by)
REFERENCES users(user_id)

);




CREATE TABLE events (

event_id INT AUTO_INCREMENT PRIMARY KEY,

organization_id INT NOT NULL,

created_by INT NOT NULL,

title VARCHAR(255) NOT NULL,

description TEXT,

location VARCHAR(255),

start_datetime DATETIME,

end_datetime DATETIME,

status ENUM(

'pending',

'approved',

'rejected',

'completed'

) DEFAULT 'pending',

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (organization_id)
REFERENCES organizations(organization_id),

FOREIGN KEY (created_by)
REFERENCES users(user_id)

);




CREATE TABLE event_registrations (

registration_id INT AUTO_INCREMENT PRIMARY KEY,

event_id INT NOT NULL,

user_id INT NOT NULL,

registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (event_id)
REFERENCES events(event_id),

FOREIGN KEY (user_id)
REFERENCES users(user_id)
 <!-- Database schema finalized --> 
);




