#  SkillBridge Project:

A modern web-based freelance marketplace connecting clients with skilled freelancers for quick and efficient project completion.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Usage Instructions](#usage-instructions)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Future Enhancements](#future-enhancements)
- [Contributing Guidelines](#contributing-guidelines)
- [License](#license)
- [Team Members](#team-members)

## Overview

SkillBridge is a comprehensive freelance marketplace that streamlines the process of connecting clients with freelancers. The platform provides a complete workflow from job posting to project completion, including bidding, contract management, milestone tracking, and secure payment processing.

Built with modern web technologies, SkillBridge ensures a seamless experience for all users while maintaining security, transparency, and accountability throughout the project lifecycle.

## Features

### Core Functionality
- *User Authentication*: Secure login, registration, and password reset
- *Profile Management*: Comprehensive profiles for clients and freelancers
- *Job Management*: Post jobs, browse opportunities, and submit proposals
- *Bidding System*: Competitive bidding with negotiation capabilities
- *Contract Management*: Automated contract creation and milestone tracking
- *File Management*: Upload and manage project deliverables
- *Payment System*: Secure payment simulation and transaction history
- *Review System*: Rating and feedback mechanism for quality assurance
- *Notifications*: Real-time activity updates and alerts
- *Complaint System*: Dispute resolution and support tickets

### Advanced Features
- *AI Recommendations*: Intelligent job matching based on skills and history
- *Admin Dashboard*: Comprehensive platform management and oversight
- *Real-time Communication*: In-platform messaging system
- *Progress Tracking*: Visual milestone and project progress indicators

## Tech Stack

### Frontend
- *React.js* - User interface framework
- *React Router* - Client-side routing
- *CSS3* - Styling and responsive design

### Backend
- *Flask* - Python web framework
- *Flask-RESTful* - REST API development
- *SQLAlchemy* - Database ORM
- *Flask-JWT-Extended* - Authentication and authorization

### Database
- *PostgreSQL* - Primary database system

### Development Tools
- *Node.js & npm* - Frontend package management
- *Python pip* - Backend package management
- *Git* - Version control

## Installation & Setup

### Prerequisites
- Python (v3.8 or higher)
- PostgreSQL (v12 or higher)
- Git

### Backend Setup

1. *Clone the repository*
   bash
   git clone <repository-url>
   cd SkillBridge_project
   

2. *Set up Python virtual environment*
   bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   

3. *Install backend dependencies*
   bash
   pip install -r requirements.txt
   

4. *Configure database*
   bash
   # Create PostgreSQL database
   createdb skillbridge_db
   
   # Set environment variables
   export DATABASE_URL="postgresql://username:password@localhost/skillbridge_db"
   export JWT_SECRET_KEY="your-secret-key"
   

5. *Initialize database*
   bash
   flask db init
   flask db migrate
   flask db upgrade
   

### Frontend Setup

1. *Navigate to client directory*
   bash
   cd Client
   

2. *Install frontend dependencies*
   bash
   npm install
   

3. *Configure environment variables*
   bash
   # Create .env file
   REACT_APP_API_URL=http://localhost:5000
   

## Usage Instructions

### Running the Application

1. *Start the backend server*
   bash
   # From project root
   python app.py
   # Server runs on http://localhost:5555
   

2. *Start the frontend development server*
   bash
   # From Client directory
   npm start
   # Application opens at http://localhost:5173
   

### Testing the Application

1. *Register as a client or freelancer*
2. *Create a job posting (client) or browse jobs (freelancer)*
3. *Submit proposals and negotiate contracts*
4. *Track project progress and milestones*
5. *Complete payments and leave reviews*

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout

### Jobs & Tasks
- GET /api/tasks - Retrieve all tasks
- POST /api/tasks - Create new task
- GET /api/tasks/:id - Get specific task
- PUT /api/tasks/:id - Update task

### Contracts
- GET /api/contracts - Retrieve contracts
- POST /api/contracts - Create contract
- PUT /api/contracts/:id - Update contract status

### Users
- GET /api/users - Get user profiles
- PUT /api/users/:id - Update user profile

For complete API documentation, refer to the backend documentation.

## Project Structure


SkillBridge_project/
├── Client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context providers
│   │   └── services/          # API service functions
│   └── package.json
├── backend/                    # Flask backend
│   ├── models/                # Database models
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic
│   └── app.py                 # Main application file
├── database/                   # Database scripts
├── requirements.txt           # Python dependencies
└── README.md


## User Roles and Permissions

### Freelancers
- Browse and search available jobs
- Submit proposals and bids
- Manage active contracts and milestones
- Upload deliverables and track payments
- Communicate with clients
- Submit complaints and disputes

### Clients
- Post job listings with budgets and deadlines
- Review and manage proposals
- Award contracts to freelancers
- Track project progress and milestones
- Process payments and leave reviews
- Submit complaints and feedback

### Administrators
- Full CRUD operations on all platform data
- User management and account oversight
- Contract monitoring and dispute resolution
- Platform analytics and reporting
- Review and complaint management

## Future Enhancements

- *AI-Powered Matching*: Enhanced recommendation algorithms
- *Real-time Chat*: WebSocket-based messaging system
- *Mobile Application*: React Native mobile app
- *Advanced Analytics*: Comprehensive reporting dashboard
- *Payment Integration*: Real payment gateway integration
- *Video Conferencing*: Built-in video call functionality
- *Multi-language Support*: Internationalization features
- *Advanced Search*: Elasticsearch integration

## Contributing Guidelines

1. *Fork the repository*
2. *Create a feature branch*
   bash
   git checkout -b feature/your-feature-name
   
3. *Make your changes and commit*
   bash
   git commit -m "Add your feature description"
   
4. *Push to your branch*
   bash
   git push origin feature/your-feature-name
   
5. *Create a Pull Request*

### Code Standards
- Follow React best practices for frontend development
- Use Flask conventions for backend API development
- Write clear, descriptive commit messages
- Include comments for complex logic
- Test your changes before submitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team members
      Dennis karanja
      Julius kakai
      Wambui karanja
      Nimrod kipngetich
      Denzel pascal

---

For questions, issues, or contributions, please contact the development team or create an issue in the repository.
