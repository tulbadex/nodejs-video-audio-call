# Video and Audio Call Application

This is a real-time video and audio call application built using Socket.io, PostgreSQL, and WebRTC.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)

## Features

- Real-time audio and video calling
- User registration and authentication
- Display online/offline status of users
- Record and save call recordings
- Fetch recent call history

## Requirements

- Node.js (v14 or higher)
- PostgreSQL
- NPM (Node Package Manager) or Yarn

## Installation

1. **Clone the repository:**
   ```
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
   ```
2. **Install dependencied**
    ```
        npm install
        # or if you prefer yarn
        yarn install
    ```
3. **Set up PostgreSQL database:**

    * Create a PostgreSQL database to align with the database name in config/config.js and config.json
    * install sequelize-cli using
    ``` npm install --save-dev sequelize-cli ```
    * migrate the table using
    ``` npx sequelize-cli db:migrate ```
    * install nodemon globally
    ``` npm install -g nodemon ```
    * To build css run
    ``` npm run build:css ```

## Usage
1. Start the server:
    ```
        npm run dev
        # or if you prefer yarn
        yarn run dev
    ```
2. Access the application:
    Open your browser and navigate to http://localhost:5600.

## Contributing
    Contributions are welcome! Please fork this repository and submit a pull request for any features, bug fixes, or enhancements.