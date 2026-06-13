# FOXTROT
ITEC 65- Open Source Technology / DCIT 55B - Advance Database Management

# OrgHub: Student Organization Management System

## 📌 Overview
OrgHub is a web-based platform designed to streamline the management of student organizations, events, and memberships.  
It provides a centralized system where **students**, **organization officers**, and **administrators** can interact efficiently.

---

## ⚙️ Features
- **User Management**: Registration, profile viewing, role updates, and account removal.  
- **Organization Management**: Submit requests, view organizations, approve/reject, and remove inactive groups.  
- **Event Management**: Create, view, approve, and delete events.  
- **Announcements**: Publish and update organization news.  
- **Transaction Processing**: Ensures ACID-compliant operations with commit/rollback handling.  
- **Data Warehouse (Star Schema)**: Supports analytical queries with Fact_Activity and dimension tables (User, Organization, Event, Date).  

---

## 🧩 System Architecture
- **Frontend**: HTML, CSS  
- **Backend**: PHP (XAMPP stack)  
- **Database**: MariaDB/MySQL  
- **Data Flow**: CRUD operations mapped to SQL transactions, ensuring reliability and integrity.  

---

## 📊 Database Design
### Fact Table
- **Fact_Activity**: Tracks measurable actions (user activity, event participation, approvals).

### Dimension Tables
- **Dim_User**: Role, Course  
- **Dim_Organization**: Category  
- **Dim_Event**: Event Type  
- **Dim_Date**: Day, Month, Year  

---

## 🚀 Installation
1. Install [XAMPP](https://www.apachefriends.org/) and ensure Apache + MySQL are running.  
2. Clone this repository:  
   ```bash
   git clone https://github.com/your-org/OrgHub.git
