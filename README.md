# Scheduling Module

## Overview
The Scheduling Module is a core component of the E-Defense System developed for 
the University of Nueva Caceres. It addresses the institutional need to eliminate 
manual scheduling conflicts, reduce coordination overhead, and streamline the 
assignment of defense sessions, rooms, timeslots, and panel members for thesis 
and capstone research defense proceedings.

The module supports the complete defense lifecycle — from student/group project 
registration and manuscript submission through to schedule creation, conflict 
detection, panel assignment, and post-scheduling notifications — ensuring that 
all defense schedules are accurate, conflict-free, and consistent with 
institutional rules.

## Features
- Schedule creation, editing, rescheduling, and cancellation
- Panel assignment with a minimum of three evaluators per session
- Automatic conflict detection and double-booking prevention
- Availability submission for panelists and advisers
- Role-specific calendar dashboards (daily, weekly, monthly views)
- Automated email and in-system notifications for schedule updates
- 24-hour reminder notifications before scheduled defenses
- Configurable scheduling rules and blackout date management
- Scheduling reports and full audit trail of all actions
- Student/group project registration and manuscript submission sub-module

## Module Status
- Under Development

## Related Database Tables
- `USER`
- `APPOINTMENT`
- `APPOINTMENT_TYPE`
- `LOCATION`
- `APPOINTMENT_PARTICIPANT`
- `APPOINTMENT_REMINDER`
- `RECURRENCE_RULE`
- `APPOINTMENT_EXCEPTION`
- `RESOURCE`
- `APPOINTMENT_RESOURCE`
- `AVAILABILITY_BLOCK`
- `NOTIFICATION`
- `AUDIT_LOG`
- `SCHEDULING_POLICY`

## Tech Stack
- **Language:** PHP / JavaScript
- **Framework:** Laravel (Backend API) / React (Frontend)
- **Database:** MySQL
- **Architecture:** Composable layered architecture with API Gateway and 
  microservices (Scheduling Service, Availability Service, Access Control, 
  Notification Service)

## Branch
This module is developed under `feature/scheduling-module`

## Main System Repository
This module is part of the 
[E-Defense System](https://github.com/DkFerrer/E-Defense-System)

## Developer
| Name | Role |
|------|------|
| Lea N. Roncesvalles | Project Manager / Scheduling Module Developer |
