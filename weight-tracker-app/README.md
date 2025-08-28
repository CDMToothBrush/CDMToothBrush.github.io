# Weight Tracker App

This project is a web application designed to track the changes in weight, body fat percentage, and visceral fat for two users: Benson and Marvis. The application features a responsive design, allowing it to function seamlessly across various devices.

## Features

- User selection to record data for either Benson or Marvis.
- Input fields for weight, body fat percentage, and visceral fat.
- Data storage in both JSON and SQLite formats.
- Visual representation of data changes through interactive charts.

## Project Structure

```
weight-tracker-app
├── src
│   ├── index.html        # Main entry point of the web application
│   ├── app.js            # Main JavaScript file for app logic
│   ├── styles.css        # Stylesheet for responsive design
│   ├── components
│   │   ├── Chart.js      # Component for displaying charts
│   │   └── UserSelector.js # Component for user selection
│   ├── data
│   │   ├── data.json     # JSON file for storing user data
│   │   └── db.sqlite      # SQLite database for storing user data
│   └── utils
│       └── storage.js     # Utility functions for data storage
├── package.json           # npm configuration file
└── README.md              # Documentation for the project
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/weight-tracker-app.git
   ```
2. Navigate to the project directory:
   ```
   cd weight-tracker-app
   ```
3. Install the necessary dependencies:
   ```
   npm install
   ```

## Usage

1. Open `src/index.html` in your web browser.
2. Select a user (Benson or Marvis) from the dropdown menu.
3. Enter the weight, body fat percentage, and visceral fat values.
4. Submit the data to see the changes reflected in the charts.

## Technologies Used

- HTML, CSS, JavaScript
- Chart.js for data visualization
- SQLite for data storage
- JSON for lightweight data storage

## Contributing

Feel free to submit issues or pull requests to improve the application. Your contributions are welcome!