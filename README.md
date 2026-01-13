

# Lost and Found System

A comprehensive web application designed to help users report, track, and recover lost items within a campus or community environment. This system facilitates the connection between people who have lost items and those who have found them, featuring specific flows for college students/staff and guest users.

## 🚀 Features

* **User Authentication & Roles:**
    * **College User:** Tailored registration for students and staff using college credentials.
    * **Guest User:** Simplified access for visitors to report or claim items.
    * **Admin Dashboard:** Dedicated interface for administrators to manage items and users.
* **Item Management:**
    * **Report Lost/Found:** Easy-to-use forms to report items with details like title, description, category, and date.
    * **Image Uploads:** Upload images of items to help with identification.
    * **Browse & Search:** Filterable list of lost and found items to help users find matches.
    * **Item Details:** Detailed view for individual items.
* **Map Integration:**
    * **Campus Map:** Visual interface to pinpoint where items were lost or found.
    * **Location Tracking:** View items on a map layout.
* **Smart Matching:**
    * **Match Suggestions:** System (implied by `MatchCard`) to suggest potential matches between lost and found reports.
* **Notifications:** Alert system to keep users updated on the status of their items.
* **Responsive Design:** Fully responsive UI built with Tailwind CSS for mobile and desktop access.

## 🛠️ Tech Stack

### Frontend
* **React:** UI library for building interactive interfaces.
* **Vite:** Next-generation frontend tooling for fast builds.
* **Tailwind CSS:** Utility-first CSS framework for styling.
* **Radix UI:** Headless UI components for accessible design.
* **React Router:** For seamless navigation and client-side routing.
* **Lucide React:** Beautiful and consistent icons.

### Backend
* **Node.js:** JavaScript runtime environment.
* **Express.js:** Web framework for building the RESTful API.
* **MongoDB & Mongoose:** NoSQL database and ODM for data modeling.
* **Multer:** Middleware for handling `multipart/form-data` (file uploads).
* **Bcrypt:** For secure password hashing.
* **Dotenv:** For environment variable management.

## 📂 Project Structure

```bash
lost-and-found-system/
├── LostAndFound/          # Frontend React Application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components (ItemCard, Navigation, etc.)
│   │   ├── context/       # React Context for state management (ItemsContext)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Application pages (Home, Browse, Report, etc.)
│   │   ├── types/         # Type definitions
│   │   ├── App.jsx        # Main application component and routing
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   ├── tailwind.config.js # Tailwind configuration
│   └── vite.config.js     # Vite configuration
│
└── backend/               # Backend Node.js Application
    ├── controllers/       # Logic for handling requests (itemController, registerController)
    ├── models/            # Mongoose models (Item, CollegeUser, GuestUser)
    ├── routes/            # API routes definitions
    ├── uploads/           # Directory for uploaded item images
    └── index.js           # Server entry point
⚙️ Installation & Setup
Prerequisites
Node.js (v14 or higher)

MongoDB (Local instance or Atlas URI)

1. Clone the Repository


git clone [https://github.com/your-username/lost-and-found-system.git](https://github.com/your-username/lost-and-found-system.git)
cd lost-and-found-system
2. Backend Setup
Navigate to the backend directory and install dependencies:



cd backend
npm install
Create a .env file in the backend directory and add your environment variables:

Code snippet

PORT=5000
MONGODB_URI=mongodb://localhost:27017/lostandfound  # Or your MongoDB Atlas URI
# Add other secrets like JWT_SECRET if applicable
Start the backend server:



npm start
# OR for development with nodemon
npm run dev 
The server will typically run on http://localhost:5000.

3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:



cd ../LostAndFound
npm install
Start the development server:



npm run dev
The application will be available at http://localhost:5173 (or the port shown in your terminal).

🔌 API Endpoints
The backend exposes several RESTful endpoints. Here are the key ones:

Items
GET /api/items - Retrieve a list of lost/found items.

GET /api/items/:id - Retrieve details of a specific item.

POST /api/items - Report a new lost or found item (supports image upload).

PUT /api/items/:id - Update an item's status.

DELETE /api/items/:id - Delete an item report.

Authentication
POST /api/register/college - Register a new college user.

POST /api/register/guest - Register a new guest user.

(Login routes would typically be here as well)

Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.

Create a new branch (git checkout -b feature/YourFeature).

Commit your changes (git commit -m 'Add some feature').

Push to the branch (git push origin feature/YourFeature).

Open a Pull Request.
