# FoodPulse Dashboard

FOODPULSE — COMPLETE FRONTEND-ONLY WEB APPLICATION

Build a complete, polished, responsive frontend-only web application called "FoodPulse", based strictly on the provided FoodPulse Software Requirements Specification (SRS).

FoodPulse is a web-based mess subscription management platform designed for students, mess managers, and administrators. Its purpose is to manage meal subscriptions, meal selection/skipping, billing status, menu management, feedback, food consumption, food wastage estimation, and smart meal-demand analytics.

1. CRITICAL PROJECT CONSTRAINT

This project is FRONTEND ONLY.

DO NOT IMPLEMENT:

Backend

Node.js / Express server

REST APIs

Database

MySQL

PostgreSQL

Supabase database

Firebase backend

Server-side authentication

Real payment gateway

UPI integration

Card integration

Wallet integration

Email server

SMS service

External AI/ML API

Real deployment configuration

Do not create unnecessary backend infrastructure.

INSTEAD:

Use:

React

TypeScript

Modern frontend component architecture

Frontend/local state

Mock JSON/data objects

LocalStorage only where useful for simulating persistence

Reusable components

Responsive layouts

Charts using a suitable frontend charting library

Frontend validation

Mock/demo interactions

The result must be a fully interactive frontend prototype, not a collection of static HTML screens.

Every major button, navigation item, tab, toggle, filter, search field, modal, form, dropdown and action should have an appropriate frontend interaction.

2. PURPOSE OF THIS PROTOTYPE

The final application should look and behave like a real FoodPulse product even though there is no backend or database.

The application should allow us to demonstrate:

Student experience

Mess Manager experience

Admin experience

Subscription management

Meal selection and skipping

Meal history

Payment/billing status

Menu management

Subscriber management

Food consumption entry

Food wastage analytics

7-day meal-demand prediction

Peak demand analysis

Smart recommendations

Feedback and complaint management

Reports

Notifications

Role-based UI

Use realistic mock data throughout the application.

3. APPLICATION BRANDING

Application name:

FoodPulse

Tagline:

Smart Mess Management. Less Waste. Better Meals.

FoodPulse should have a modern SaaS/dashboard appearance suitable for a professional college software project.

Design characteristics:

Clean

Modern

Professional

Minimal

Data-driven

Food/meal-oriented

Easy to navigate

Mobile responsive

Accessible

Consistent spacing

Consistent typography

Consistent cards, tables, buttons and badges

Do not make the interface look like a generic admin template.

Create a recognizable FoodPulse visual identity.

4. USER ROLES

The frontend must support three simulated roles:

STUDENT

Primary end user.

MESS MANAGER

Responsible for daily mess operations, menu, subscribers, payments, meal consumption, wastage and analytics.

ADMIN

Highest-privilege system administrator responsible for users, mess managers, plans, subscriptions, payments, reports, security/audit information and system settings.

5. DEMO LOGIN

Because there is no backend authentication, create a Demo Login System.

Login page should contain:

Email

Password

Login button

Forgot Password

Register

Also provide clearly visible demo account buttons:

Student Demo

Login as Student

Mess Manager Demo

Login as Mess Manager

Admin Demo

Login as Admin

Clicking a demo role should open the corresponding dashboard.

Use frontend state/localStorage to remember the currently selected demo role.

Implement protected frontend routes so that:

Student sees only Student interface

Mess Manager sees only Mess Manager interface

Admin sees only Admin interface

This is a UI simulation only and must not be treated as real security.

6. PUBLIC WEBSITE

Create the following public pages:

6.1 Home

Sections:

Hero

Headline:

Manage Meals Smarter. Reduce Food Waste.

Supporting text explaining FoodPulse.

Buttons:

Get Started

Explore FoodPulse

Login

Problem Section

Explain:

Manual mess management

Fixed meal planning

Food wastage

Unclear billing

Difficulty estimating daily demand

Solution Section

Show how FoodPulse solves these problems.

Core Features

Cards for:

Flexible Meal Plans

Meal Selection

Meal Skip

Subscription Management

Billing

Menu Management

Feedback

Demand Prediction

Food Wastage Analytics

Smart Suggestions

How FoodPulse Works

Visual flow:

Register → Choose Plan → Select/Skip Meals → Mess Uses Demand Data → Reduce Waste

Smart Analytics Highlight

Show a visually impressive preview of:

Tomorrow's predicted meals

Wastage percentage

Peak demand

Smart recommendation

CTA

"Start Using FoodPulse"

7.2 ABOUT PAGE

Include:

What is FoodPulse?

Purpose

Target environments:

College mess

Hostel

PG

Office/canteen

Main objectives:

Flexible subscription

Transparent billing

Easier meal management

Reduced food wastage

Data-driven decision making

7.3 HOW IT WORKS

Create a step-by-step visual explanation:

Student registers

Student selects Weekly/Monthly plan

Student selects/skips upcoming meals

Mess Manager sees expected meal demand

Mess prepares meals

Consumption/wastage is recorded

FoodPulse generates analytics and recommendations

7.4 FEATURES PAGE

Create detailed feature cards/sections for all major FoodPulse functionality.

7.5 HELP / FAQ

Create FAQ sections for:

Registration

Subscription

Meal selection

Meal skipping

Cutoff deadline

Payments

Menu

Feedback

Complaints

Analytics

Also include:

Student Quick Start

Mess Manager Guide

Admin Guide

These can be frontend documentation pages.

7.6 CONTACT PAGE

Create a professional contact form with:

Name

Email

Subject

Message

Submit button

Submission should display a frontend success message.

8. AUTHENTICATION UI

Create:

Login

Email

Password

Remember me

Login

Demo login buttons

Registration

Fields:

Full Name

Email

Contact Number

Password

Confirm Password

Frontend validation:

Required fields

Email format

Password match

Password strength

Forgot Password

Email field and simulated reset-success state.

9. STUDENT PORTAL

Create a persistent Student layout with:

Sidebar

Top navigation

Notification icon

Profile menu

Logout

Responsive mobile navigation

Student sidebar:

Dashboard

Meals

Meal Calendar

Meal History

Subscription

Available Plans

My Subscription

Payments

Current Bill

Payment History

Feedback & Complaints

Give Feedback

My Complaints

Notifications

Profile

Help

10. STUDENT DASHBOARD

Create a highly polished dashboard.

Top KPI cards:

Current Plan

Example:
Monthly Plan

Subscription Status

Active

Meals Used

42

Meals Remaining

48

Next Meal

Lunch — Tomorrow

Today's Meals

Show:

Breakfast

Selected

Lunch

Selected

Dinner

Skipped

Use clear status badges.

Subscription Progress

Display:

Meals Used / Total Meals

with a progress bar.

Upcoming Meals

Show next 7 days.

Each day should display:

Breakfast

Lunch

Dinner

Selected/Skipped/Locked status

Notifications

Examples:

Subscription expires in 3 days

Meal selection deadline approaching

Payment pending

Menu updated

11. AVAILABLE PLANS PAGE

Create attractive subscription plan cards.

Weekly Plan

Include:

Price

Duration

Number of meals

Breakfast

Lunch

Dinner

Subscribe button

Monthly Plan

Same structure.

Also include:

Current plan indicator

Comparison between plans

When user clicks Subscribe:

Show confirmation modal.

After confirmation, update frontend state to simulate an active subscription.

Do not implement actual payment.

12. MY SUBSCRIPTION PAGE

Display:

Plan name

Status

Start date

End date

Total meals

Used meals

Remaining meals

Progress bar

Actions:

Renew

Request Pause

Request Cancellation

For pause/cancellation:

Show a confirmation/request modal and update frontend request status.

Example:

Cancellation Request Pending

13. MEAL CALENDAR

This is one of the most important Student screens.

Create a calendar-based meal management interface.

Show upcoming subscription dates.

For each date show:

Breakfast

Selected / Skipped / Locked

Lunch

Selected / Skipped / Locked

Dinner

Selected / Skipped / Locked

Allow the student to toggle meals before the simulated cutoff.

Default cutoff:

10:00 PM on the previous day.

For demonstration purposes, create mock dates where:

Some meals are editable

Some meals are locked because cutoff has passed

When a locked meal is clicked:

Show:

"Meal selection deadline has passed. This meal can no longer be changed."

Add confirmation before skipping a meal.

14. MEAL HISTORY

Create:

Filters:

Date range

Meal type

Status

Table columns:

Date

Meal

Menu

Selection

Attendance

Rating

Use realistic sample data.

Include empty state and no-results state.

15. MEAL DETAILS

When a meal is clicked, show:

Date

Meal type

Menu

Selection status

Attendance status

Rating

Feedback

Allow rating from 1–5 stars.

16. STUDENT PAYMENTS

Create:

Current Bill

Display:

Plan

Base amount

Adjustment

Total

Payment status

Status:

Paid

Unpaid

Do NOT integrate any payment gateway.

Instead provide a frontend button such as:

View Payment Instructions

or

Mark as Demo Payment

which changes the mock status for demonstration.

Payment History

Columns:

Invoice

Date

Plan

Amount

Status

View Bill

Create a bill/invoice modal.

17. STUDENT FEEDBACK

Create:

Food Rating

Meal

Date

1–5 star rating

Complaint / Suggestion

Fields:

Meal

Date

Category

Description

Submit button.

After submission show:

Feedback submitted successfully.

18. MY COMPLAINTS

Display complaint cards/table with:

Complaint ID

Date

Meal

Description

Status

Manager response

Statuses:

OPEN
IN PROGRESS
RESOLVED

Include notification when status changes.

19. STUDENT NOTIFICATIONS

Create notification center.

Examples:

Subscription expiry reminder

Payment reminder

Meal cutoff reminder

Menu update

Complaint status update

Support:

Read/unread

Mark as read

Mark all as read

20. STUDENT PROFILE

Fields:

Name

Email

Contact number

Actions:

Edit profile

Save

Change password

Logout

Use frontend validation.

21. MESS MANAGER PORTAL

Create a separate persistent Mess Manager layout.

Sidebar:

Dashboard

Today's Meals

Menu Management

Subscribers

Payments

Meal Consumption

Food Wastage

Smart Analytics

Feedback & Complaints

Reports

Notifications

Profile

Help

22. MESS MANAGER DASHBOARD

Create a professional operational dashboard.

KPI cards:

Active Subscribers

Today's Total Meals

Breakfast Count

Lunch Count

Dinner Count

Pending Payments

Create:

Weekly Meal Trend Chart

Show realistic 7-day data.

Today's Meal Demand

Breakfast / Lunch / Dinner.

Upcoming Demand

Show tomorrow's expected demand.

Wastage Summary

Show current wastage percentage.

Smart Recommendation

Example:

"Weekend dinner demand is 18% lower than weekday average. Consider reducing Sunday dinner preparation."

23. TODAY'S MEALS

Create an operational screen.

For each meal:

Breakfast

Expected

Prepared

Consumed

Wasted

Wastage %

Lunch

Expected

Prepared

Consumed

Wasted

Wastage %

Dinner

Expected

Prepared

Consumed

Wasted

Wastage %

Use visual status cards.

24. MENU MANAGEMENT

Mess Manager can:

View menu

Add menu

Edit menu

Delete/deactivate menu

Mark special meal

Mark festival meal

Menu fields:

Date

Meal type

Menu items

Special/festival flag

Create modal forms.

After saving, update the frontend mock data.

25. SUBSCRIBER MANAGEMENT

Create a searchable/filterable subscriber table.

Columns:

Student

Email

Plan

Start Date

End Date

Status

Meals Used

Payment Status

Actions

Filters:

Active

Expired

Pending

Cancelled

Paused

Actions:

View

View subscription

View meal history

View payment

Approve cancellation

Approve pause

26. MESS MANAGER PAYMENT MANAGEMENT

Dashboard cards:

Total Payments

Paid

Unpaid

Pending Amount

Table:

Student

Plan

Amount

Date

Status

Action

Actions:

Mark Paid

Mark Unpaid

View Bill

These actions should update frontend state only.

27. MEAL CONSUMPTION

Create a data-entry interface.

For selected date and meal:

Expected meals

Prepared meals

Consumed meals

Calculate automatically in frontend:

Wasted = Prepared − Consumed

Also display wastage percentage.

Validate:

Prepared cannot be negative

Consumed cannot be negative

Consumed cannot exceed Prepared

28. FOOD WASTAGE PAGE

Create analytics cards:

Total Prepared

Total Consumed

Total Wasted

Average Wastage %

Charts:

Daily wastage

Meal-wise wastage

Weekly wastage

Filters:

7 days

30 days

Custom date range

29. SMART ANALYTICS DASHBOARD

This is the core differentiating feature of FoodPulse.

Create a visually impressive analytics dashboard.

Section 1 — Tomorrow's Demand Prediction

Display separately:

Breakfast
245 meals

Lunch
302 meals

Dinner
270 meals

Show:

Prediction method: 7-day rolling average

This is a frontend demonstration using mock data.

Do not implement external AI/ML.

30. PEAK DEMAND ANALYSIS

Create chart:

Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday

Show average meal demand.

Highlight:

Peak day

Lowest demand day

31. WEEKDAY VS WEEKEND ANALYSIS

Compare:

Weekday average
Weekend average

For:

Breakfast

Lunch

Dinner

Highlight deviations.

Example:

Weekend Dinner: -18%

32. MEAL POPULARITY

Create selectable date range.

Show:

Breakfast

Lunch

Dinner

using charts.

Allow:

7 days

30 days

Custom

33. SMART SUGGESTIONS

Create recommendation cards.

Examples:

Reduce Preparation

"Weekend dinner demand is 18% lower than weekday average. Consider reducing preparation quantity."

Increase Preparation

"Lunch demand has increased over the last 7 days. Consider increasing lunch preparation."

Stable Demand

"Breakfast demand is stable. Maintain current preparation level."

Use icons and priority indicators.

34. FEEDBACK & COMPLAINT MANAGEMENT — MANAGER

Dashboard cards:

Total Feedback

Open

In Progress

Resolved

Average Rating

Create searchable complaint table.

Actions:

View complaint

Change status

Add response

Statuses:

OPEN
IN PROGRESS
RESOLVED

When manager changes status, update mock Student complaint data as well.

35. MESS MANAGER REPORTS

Create a Reports page with tabs:

Subscription Report

Active

Expired

New

Renewed

Cancelled

Payment Report

Paid

Unpaid

Revenue

Pending dues

Meal Consumption Report

Breakfast

Lunch

Dinner

Total consumption

Food Wastage Report

Prepared

Consumed

Wasted

Wastage %

Feedback Report

Average rating

Complaints

Resolved complaints

Add date-range filtering.

Include frontend buttons:

Export CSV

Print Report

These can simulate export/print behavior without backend.

36. ADMIN PORTAL

Create a separate Admin layout.

Sidebar:

Dashboard

Users

Mess Managers

Plans

Subscriptions

Payments

Analytics

Reports

Feedback

Audit Logs

Settings

Profile

Help

37. ADMIN DASHBOARD

KPI cards:

Total Students

Active Subscribers

Mess Managers

Active Plans

Total Payments

Pending Payments

Charts:

User growth

Subscription trends

Meal demand

Payment trends

Wastage overview

38. USER MANAGEMENT

Create:

User table

Search

Filter by role

Filter by status

Columns:

Name

Email

Contact

Role

Status

Joined Date

Actions

Actions:

View

Edit

Activate

Deactivate

Roles:

Student

Mess Manager

Admin

Use confirmation modals for destructive actions.

39. MESS MANAGER MANAGEMENT

Admin can:

View managers

Add manager

Edit manager

Activate/deactivate manager

Fields:

Name

Email

Phone

Assigned mess

Status

40. PLAN MANAGEMENT

Admin can:

Add plan

Edit plan

Deactivate plan

Fields:

Plan name

Type: Weekly / Monthly

Price

Duration

Included meals

Description

Status

Changes should update the frontend Student Available Plans page.

41. SUBSCRIPTION MANAGEMENT

Admin can view:

Active

Expired

Cancelled

Paused

Pending

Create filters and search.

42. ADMIN PAYMENT MANAGEMENT

Create:

Payment summary

Payment table

Paid/Unpaid filters

Search

Payment detail modal

Mark Paid

Mark Unpaid

Changes should update frontend mock state.

43. ADMIN ANALYTICS

Create organization-level analytics:

Meal demand

Wastage

Subscription trends

Payment trends

Meal popularity

Peak demand

Weekday vs weekend

Use charts and date filters.

44. ADMIN REPORTS

Create report tabs:

User Report

Subscription Report

Payment Report

Meal Consumption Report

Food Wastage Report

Feedback Report

Each report should have:

Filters

Table

Summary cards

Chart where appropriate

Print button

Export CSV button

45. AUDIT LOGS

Create an Admin Audit Logs page.

Display:

Date/time

User

Action

Module

Description

Status

Example:

Admin changed payment status:

Unpaid → Paid

Admin edited plan:

₹2500 → ₹2700

Admin deactivated user.

Use realistic mock audit data.

46. SYSTEM SETTINGS

Create settings sections:

Mess Settings

Mess name

Contact

Address

Operating hours

Meal Settings

Breakfast

Lunch

Dinner

Cutoff Settings

Default:

10:00 PM previous day

Notification Settings

Subscription expiry

Payment reminder

Meal deadline

Complaint update

Use switches/toggles.

47. ADMIN PROFILE

Fields:

Name

Email

Contact

Role

Actions:

Edit

Save

Change Password

Logout

48. NOTIFICATION SYSTEM

Create a reusable notification component used across dashboards.

Notification types:

Success

Warning

Error

Information

Create notification center with:

Read/unread

Mark as read

Mark all as read

Use mock notifications.

49. GLOBAL SEARCH

Create a frontend global search accessible from the dashboard header.

Search mock data for:

Students

Plans

Payments

Subscriptions

Complaints

Menu items

Display categorized search results.

50. EMPTY / LOADING / ERROR STATES

Every major list/table should support:

Loading

Skeleton loaders.

Empty

Example:

"No complaints found."

Error

Example:

"Unable to load data. Please try again."

Even though this is frontend-only, create these states for realistic UX.

51. MODALS AND CONFIRMATIONS

Create reusable modal components for:

Subscribe

Cancel subscription

Pause subscription

Skip meal

Edit plan

Delete/deactivate menu

Mark payment paid

Change complaint status

Add menu

Add user

Add manager

Use clear confirmation and cancellation buttons.

52. MOCK DATA

Create centralized frontend mock data.

Include realistic data for:

Users

At least 15–20 students.

Plans

Weekly and Monthly.

Subscriptions

Active, expired, paused, cancelled.

Meals

At least 30 days of mock Breakfast/Lunch/Dinner data.

Payments

Paid and Unpaid.

Menus

Breakfast/Lunch/Dinner menus.

Feedback

1–5 star ratings.

Complaints

Open/In Progress/Resolved.

Consumption

Prepared and Consumed quantities.

Analytics

7-day and 30-day data.

Notifications

Multiple notification types.

Audit logs

Realistic Admin actions.

Do not use lorem ipsum or obviously fake placeholder content.

53. FRONTEND STATE

Use frontend state to simulate application behavior.

Examples:

Selecting a meal updates its status.

Skipping a meal updates the calendar.

Subscribing to a plan updates subscription state.

Marking payment as Paid updates payment status.

Editing a menu updates menu display.

Changing complaint status updates complaint status.

Updating consumption updates wastage calculations.

Changing plan price updates plan cards.

Notifications become read when clicked.

Use LocalStorage where useful so demo changes survive page refresh during the same browser session.

54. BUSINESS RULES TO SIMULATE

Implement these frontend rules:

Student can have only one active subscription in the UI.

Only active subscribers can select/skip meals.

Locked meals cannot be changed.

Default meal cutoff is 10:00 PM previous day.

Payment status can be changed only from Manager/Admin interfaces.

Only Admin UI can manage users and Mess Managers.

Only Manager/Admin UI can access payment and analytics screens.

Prepared quantity cannot be lower than consumed quantity.

Payment/subscription records should not have permanent delete buttons; use deactivate/void where appropriate.

Confirmation should be required for destructive actions.

Important:

These are frontend demonstrations only, not real security or server-side enforcement.

55. RESPONSIVE DESIGN

The entire application must work on:

Desktop

Laptop

Tablet

Mobile

For mobile:

Collapsible sidebar

Bottom navigation where appropriate

Responsive tables

Horizontally scrollable data tables when necessary

Stacked cards

Mobile-friendly charts

Mobile-friendly forms and modals

Do not simply shrink the desktop interface.

Design proper responsive layouts.

56. REUSABLE COMPONENTS

Create reusable components for:

Sidebar

Topbar

Dashboard cards

Status badges

Buttons

Tables

Search

Filters

Modal

Form fields

Date picker

Calendar

Notification panel

Charts

Empty state

Loading skeleton

Confirmation dialog

Toast notifications

Progress bars

Rating component

Avoid duplicating components unnecessarily.

57. VISUALIZATION REQUIREMENTS

Use appropriate charts for:

Weekly meal demand

Meal popularity

Food wastage

Subscription trends

Payment trends

User growth

Weekday/weekend comparison

Charts should have:

Clear labels

Tooltips

Legends where useful

Responsive sizing

Meaningful mock data

Do not create charts purely for decoration.

58. ACCESSIBILITY AND UX

Implement:

Proper labels

Keyboard-friendly controls

Clear focus states

Accessible buttons

Readable contrast

Helpful validation messages

Confirmation messages

Clear status indicators

Avoid relying only on color to communicate status

59. NAVIGATION

All navigation links must work.

No dead links.

No placeholder "Coming Soon" pages for functionality that is part of the SRS.

Every listed page must be implemented.

Breadcrumbs should be used where helpful on deeper pages.

60. FRONTEND ROUTING

Create proper frontend routes for all major pages.

Suggested structure:

/
 /about
 /how-it-works
 /features
 /help
 /contact

 /login
 /register
 /forgot-password

 /student/*
 /manager/*
 /admin/*


Use route guards based on the simulated demo role.

61. DESIGN QUALITY

The application should feel like a real SaaS product.

Avoid:

Generic template appearance

Excessive gradients

Excessive animations

Huge unnecessary text

Random colors

Inconsistent spacing

Inconsistent buttons

Unstyled tables

Static screenshots pretending to be dashboards

Use subtle animations only where they improve UX.

62. IMPORTANT SRS ALIGNMENT

The frontend must visually represent the following major SRS features:

Authentication

Registration, login, profile and role-based interface.

Subscription

Weekly/Monthly plans, active/expired status, renewal, pause/cancellation request.

Meal Management

Breakfast/Lunch/Dinner selection, skip functionality, calendar, cutoff state, meal history and progress.

Payment

Bills, Paid/Unpaid status, payment history.

Admin/Manager

Plans, users, subscribers, menus, payments, dashboards and reports.

Smart Analytics

7-day rolling-average demand prediction, wastage estimation, peak demand, meal popularity, weekday/weekend comparison and textual smart suggestions.

Feedback

1–5 rating, complaint/suggestion, complaint status and manager response.

These are the core functional areas described in the SRS.

63. DO NOT OVER-IMPLEMENT TBD FEATURES

The SRS marks several features as TBD/future enhancements.

Do NOT implement these as real functionality:

Real UPI/card/wallet payment gateway

Advanced machine-learning demand forecasting

QR-code meal verification

IoT kitchen integration

Native Android/iOS application

AI chatbot

If desired, show them only as clearly labelled Future Enhancements in the public About/Features documentation.

Do not make them part of the working application.

64. FINAL DEMO FLOW

The finished frontend should support this complete demonstration:

Student Demo

Login as Student

→ Dashboard

→ View Available Plans

→ Subscribe to Monthly Plan

→ View My Subscription

→ Open Meal Calendar

→ Select/Skip meals

→ See locked meal after cutoff

→ View Meal History

→ View Bill

→ View Payment History

→ Rate a meal

→ Submit complaint

→ View complaint status

→ View notifications

Mess Manager Demo

Logout

→ Login as Mess Manager

→ Dashboard

→ View today's meal demand

→ Update menu

→ View subscribers

→ View pending payment

→ Mark payment as Paid

→ Enter prepared/consumed quantity

→ See wastage calculation

→ Open Smart Analytics

→ View predicted Breakfast/Lunch/Dinner demand

→ View peak-demand day

→ View meal popularity

→ View smart recommendation

→ Resolve student complaint

→ Generate/view report

Admin Demo

Logout

→ Login as Admin

→ Dashboard

→ View system statistics

→ Manage users

→ Manage Mess Managers

→ Create/edit/deactivate plan

→ View subscriptions

→ View payments

→ View analytics

→ View reports

→ View audit logs

→ Change system settings

65. FINAL QUALITY CHECK

Before considering the project complete, verify:

All routes work.

All navigation links work.

No broken pages.

No console errors.

No missing components.

No placeholder lorem ipsum.

All major buttons have interactions.

Forms have validation.

Modals work.

Tables have realistic data.

Search works on mock data.

Filters work.

Charts render correctly.

Student flow works.

Mess Manager flow works.

Admin flow works.

Role-based navigation works.

Meal selection/skip simulation works.

Subscription simulation works.

Payment status simulation works.

Menu management simulation works.

Complaint status simulation works.

Wastage calculation works on the frontend.

Smart Analytics displays realistic mock results.

Responsive layouts work on desktop/tablet/mobile.

No backend or database is required.

No external API is required.

No real payment gateway is required.

FINAL INSTRUCTION

Build the complete FoodPulse frontend as a single cohesive, production-quality interactive prototype.

Do not stop after creating only the dashboard.

Implement all public pages, authentication screens, Student pages, Mess Manager pages, Admin pages, analytics pages, reports, forms, tables, modals, charts, navigation, mock data and frontend interactions described above.

The application should be ready to demonstrate as a complete FoodPulse product UI.

Again:

FRONTEND ONLY.
NO BACKEND.
NO DATABASE.
NO API.
NO REAL AUTHENTICATION.
NO REAL PAYMENT GATEWAY.
NO EXTERNAL AI/ML.
USE MOCK DATA + FRONTEND STATE.
IMPLEMENT THE COMPLETE INTERACTIVE UI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7d55c251-3645-48b3-b67f-448b6dd1aa33).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
