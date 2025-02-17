# Wolt Backend Engineering Internship Assignment

## Description

This is my preliminary assignment solution for the Wolt 2025 Backend Engineering Internship. The assignment is created using Node.js + Express.js + Typescript.

The Delivery Order Price Calculator service calculates delivery order prices based on cart value, delivery distance, and venue specific pricing rules.

> Your task is to implement the Delivery Order Price Calculator service, or DOPC for short! DOPC is an imaginary backend service which is capable of calculating the total price and price breakdown of a delivery order. DOPC integrates with the Home Assignment API to fetch venue related data required to calculate the prices. The term venue refers to any kind of restaurant / shop / store that's in Wolt. Let's not make strict assumptions about the potential clients of DOPC: they might be other backend services, Wolt's consumer mobile apps, or even some third parties which integrate with Wolt.

## Prerequisites

- Node.js >= 20.12.0 < 21
- npm

## Installation

1. Install dependencies

```bash
npm install
```

2. Project files should already include .env file. If not, create a .env file in the project root with the following content:

```bash
PORT=8000
API_BASE_URL=https://consumer-api.development.dev.woltapi.com
```

## Running the Application

### Development

```bash
1. npm start

2. To stop use Ctrl + C in terminal
```

The server will start at http://localhost:8000 (or the port specified in your .env file).

### Running Tests

```bash
# Run tests
npm run test

# Test coverage
npm run test:coverage
```

### Linting

```bash
# Run lint
npm run lint

# Lint fix
npm run lint:fix
```

## Usage

Example request:

```bash
curl http://localhost:8000/api/v1/delivery-order-price?venue_slug=home-assignment-venue-helsinki&cart_value=1000&user_lat=60.17094&user_lon=24.93087
```
