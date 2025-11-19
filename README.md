# Hotel Booking System

![React](https://img.shields.io/badge/React-18.2-%2361DAFB?style=for-the-badge&logo=react)
![Ant Design](https://img.shields.io/badge/Ant%20Design-0170FE?style=for-the-badge&logo=antdesign&logoColor=white)
![JSON Server](https://img.shields.io/badge/json--server-mock%20api-red?style=for-the-badge)

A complete hotel reservation platform with separate **User** and **Admin** dashboards.

## Features
- ثبت‌نام و ورود با نقش کاربر/ادمین
- جستجو و فیلتر پیشرفته هتل‌ها
- رزرو هتل با تشخیص تداخل تاریخ
- داشبورد کاربر و ادمین کامل
- سیستم نوتیفیکیشن
- طراحی ریسپانسیو با Ant Design

## Tech Stack
- React.js + Vite + React Router + Axios
- Ant Design (v5)
- json-server (mock API)
- db.json as database

## How to Run

```bash
# Backend
npx json-server --watch db.json --port 3000

# Frontend
npm install
npm run dev
```

## Screenshots

![Homepage](./screenshots/homepage.png)
![Hotel List](./screenshots/hotellist.png)
![Hotel Details](./screenshots/hoteldetails.png)
![Login](./screenshots/login.png)
![Register](./screenshots/register.png)
![User Dashboard](./screenshots/userDashboard.png)
![Admin Dashboard](./screenshots/adminDashboard.png)
![Admin Dashboard 2](./screenshots/adminDashboard2.png)