# Enes Baş — Portfolio OS

A full-stack web portfolio built with a Windows 95 desktop aesthetic. Features draggable/resizable windows, a PHP/MySQL backend, an admin dashboard, and a live contact form.

**Live Demo:** https://enesbasportfolio.42web.io

---

## Features

- Windows 95-style UI with draggable, resizable, minimizable windows
- Animated preloader with orbiting SVG text ring (GSAP)
- Text scramble effect on hover
- CRT monitor scanline overlay
- Social Hub with LinkedIn, itch.io, and GitHub tabs
- Live GitHub stats fetched from the GitHub API
- PDF resume viewer (PDF.js)
- Contact form with JavaScript validation and AJAX submission
- Projects loaded dynamically from a MySQL database
- Admin dashboard to add/delete projects and view contact messages
- Session-based admin login with a 7-day remember-me cookie

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Animations | GSAP 3, Interact.js |
| Backend | PHP 7.4 |
| Database | MySQL (PDO) |
| Hosting | InfinityFree |

---

## Project Structure

```
port/
├── index.html          # Main portfolio page
├── style.css           # All styles
├── script.js           # UI logic, validation, AJAX
├── contact.php         # Handles contact form POST → MySQL
├── projects.php        # Returns projects as JSON
├── db.example.php      # Database config template
├── portfolio.sql       # SQL schema and seed data
└── admin/
    ├── login.php       # Admin login with session + cookie
    ├── dashboard.php   # Manage projects and view messages
    └── logout.php      # Destroys session and cookie
```

---

## Setup

1. Clone the repository
2. Copy `db.example.php` to `db.php` and fill in your database credentials
3. Import `portfolio.sql` into your MySQL database via phpMyAdmin
4. Upload all files to your PHP host
5. Visit `/admin/login.php` to access the admin panel

---

## Admin Panel

Access at `/admin/login.php`

From the dashboard you can:
- Add and delete portfolio projects
- View all contact messages submitted through the site
