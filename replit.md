# Care Class Pharmacy POS & Inventory

A single-page pharmacy point-of-sale and inventory management system for **Care Class Pharmacy**, built with plain HTML, Tailwind CSS (CDN), Chart.js, and vanilla JavaScript. No build step or backend required.

## Running the app

The workflow **"Start application"** serves the project:

```
python3 -m http.server 5000
```

Open the preview at port 5000.

## Features

- **POS Dispensing** — barcode scan/search, cart management, multi-method checkout (Airtel Money, MTN MoMo, Zamtel, Card, Cash)
- **Stock & Inventory** — batch stock loading, expiry tracking, master inventory table
- **Daily Reports** — revenue, transaction count, units sold, low-stock alerts, sales audit log
- **Product Performance & Analytics** — Chart.js charts, dead-stock warnings, reorder priorities, decision matrix

## Currency

Supports ZMW Kwacha (K) and USD ($) display with a configurable exchange rate. All prices are stored internally in Kwacha.

## Data persistence

All data (inventory, sales history, metrics) lives in JavaScript variables in `index.html`. There is no database — data resets on page reload.

## User preferences

<!-- Add any remembered preferences here -->
