# README

## Project: URL Shortener

### Overview

This project is a simple URL Shortener system. It allows users to shorten long URLs, manage them, and view basic analytics such as click counts.

### Features

* Generate short links from long URLs
* Redirect to the original link when the short link is accessed
* Track basic analytics (click counts, timestamps)
* Manage links (create, view, deactivate)

### Tech Stack

* **Frontend:** React (for user interface)
* **Backend:** Node.js with Express (for API and redirect handling)
* **Database:** MySQL/PostgreSQL (to store links and analytics)
* **Cache:** Redis (for faster lookups of popular short links)

### Setup Instructions

1. Clone this repository.
2. Install dependencies for frontend and backend using `npm install`.
3. Configure environment variables (DB connection, Redis, etc.).
4. Run database migrations to create required tables.
5. Start backend server: `npm run start`.
6. Start frontend: `npm run dev`.

### Data Model

* **Links Table:** Stores shortcode, original URL, creation date, expiry date, and click count.
* **Clicks Table:** Stores individual click events with timestamp and optional referrer/device info.

### Assumptions

* Authentication is not mandatory but can be added later.
* The system is read-heavy, so caching is used to improve performance.
* Only basic analytics are needed for this version.

### Future Improvements

* Add authentication and user accounts
* Provide advanced analytics (geo-location, device types)
* Implement role-based access control
* Support link previews and custom domains
