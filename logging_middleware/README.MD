# Logging Middleware

Reusable logging middleware for AffordMed Backend Assessment.

## Features

- Authentication with evaluation server
- Reusable Log function
- Supports:
  - debug
  - info
  - warn
  - error
  - fatal

## Usage

```js
await Log(
  "backend",
  "info",
  "middleware",
  "Application started"
);