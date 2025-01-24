# YouTube API

This project is a Node.js-based API that uses Puppeteer to scrape data from YouTube. It provides endpoints to retrieve information about YouTube channels, videos, and specific video details.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
  - [Root Endpoint](#root-endpoint)
  - [Channel Data](#channel-data)
  - [Channel Videos](#channel-videos)
  - [Video Data](#video-data)
- [Error Handling](#error-handling)
- [License](#license)

---

## Installation

### Prerequisites

Make sure you have Node.js installed on your machine. You can download it from [Node.js Official Website](https://nodejs.org/).

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd <project-directory>
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   `bash
node app.js
`
   The server will run on `http://localhost:8000`.

---

## Usage

Use any API client (e.g., Postman) or browser to make requests to the available endpoints. Replace `:channelName` or `:videoId` placeholders with actual values.

### Base URL

```
http://localhost:8000
```

---

## Endpoints

### Channel Data

**GET** `/api/channel/:channelName`

Fetch details about a specific YouTube channel.

**Parameters:**

- `channelName`: The name of the YouTube channel (e.g., `GoogleDevelopers`).

**Response Example:**

```json
[
  {
    "channelName": "Google Developers",
    "profileImageUrl": "https://yt3.ggpht.com/...",
    "description": "Welcome to the official Google Developers channel.",
    "totalSubscribers": "2.5M",
    "totalVideos": "1000",
    "totalViews": "500M",
    "joinedAt": "Jan 1, 2005"
  }
]
```

---

### Channel Videos

**GET** `/api/videos/:channelName`

Retrieve data about the latest uploaded videos from a specific YouTube channel.

**Parameters:**

- `channelName`: The name of the YouTube channel (e.g., `GoogleDevelopers`).

**Response Example:**

```json
[
  {
    "videoId": "abcd1234",
    "title": "Introduction to Machine Learning",
    "href": "https://www.youtube.com/watch?v=abcd1234",
    "views": "100K",
    "videoDuration": "10:30",
    "videoPosted": "1 week ago"
  }
]
```

---

### Video Data

**GET** `/api/video/:videoId`

Retrieve detailed information about a specific YouTube video.

**Parameters:**

- `videoId`: The ID of the YouTube video (e.g., `abcd1234`).

**Response Example:**

```json
[
  {
    "videoTitle": "Introduction to Machine Learning",
    "videoViews": "100K",
    "postedAt": "Jan 1, 2023",
    "likes": "10K",
    "comments": "500"
  }
]
```

---

## Error Handling

If there is an issue fetching data, the API responds with a 500 status code and an error message:

**Response Example:**

```json
{
  "error": "Failed to fetch channel data. Channel not found."
}
```

---

## License

This project is licensed under the MIT License. Feel free to use, modify, and distribute it as per the terms of the license.

---

## Notes

- The API heavily relies on Puppeteer, which may consume more memory and resources.
- Ensure the YouTube UI structure has not changed, as it might break the selectors used in the scraping process.
- Use this responsibly and comply with YouTube's terms of service.
