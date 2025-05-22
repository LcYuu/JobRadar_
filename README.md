# JobPortal Project

A comprehensive job portal platform connecting job seekers and employers with intelligent job matching, resume building, and company management features.

## Project Overview

JobPortal is a full-stack web application designed to streamline the job search and recruitment process. The platform offers tailored experiences for job seekers, employers, and administrators with features including:

- Job search and filtering
- Company profiles and reviews
- Resume/CV creation and management
- Employer job posting and candidate management
- Admin dashboard for platform management
- Real-time notifications and messaging
- Authentication and authorization

## Tech Stack

### Frontend (jobportal_Client)
- **Framework**: React.js
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **UI Libraries**: 
  - Material UI
  - Radix UI
  - TailwindCSS
  - Framer Motion
- **Form Handling**: Formik, Yup
- **API Communication**: Axios
- **PDF Handling**: React PDF Viewer/Renderer
- **Rich Text Editing**: TinyMCE, React Quill
- **Charts**: Recharts
- **Notifications**: React Hot Toast, SweetAlert2

### Backend (jobportal_Server)
- **Framework**: Spring Boot 3.3
- **Language**: Java 21
- **Database**: MySQL
- **ORM**: Spring Data JPA
- **Authentication**: Spring Security, JWT
- **Real-time Communication**: WebSockets (STOMP)
- **Email**: Spring Mail
- **Caching**: Redis
- **API Documentation**: Swagger/OpenAPI

### Additional Technologies
- **Data Processing**: OpenCSV
- **WebDriver Automation**: Selenium
- **OAuth Integration**: Google OAuth

## Getting Started

### Prerequisites
- Java 21 JDK
- Node.js (v18 or higher)
- MySQL Server
- Redis Server (optional, for caching)
- Maven

### Backend Setup
1. Navigate to the server directory:
   ```
   cd jobportal_Server/job-portal
   ```

2. Configure database connection in `src/main/resources/application.properties`

3. Build and run the Spring Boot application:
   ```
   ./mvnw spring-boot:run
   ```
   Or on Windows:
   ```
   mvnw.cmd spring-boot:run
   ```

4. The backend API will be available at `http://localhost:8080`

### Frontend Setup
1. Navigate to the client directory:
   ```
   cd jobportal_Client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. The frontend application will be available at `http://localhost:3000`

## Features

### For Job Seekers
- Create and manage profile
- Build and customize resumes/CVs
- Search and apply for jobs
- Save favorite jobs and companies
- Track application status
- Receive job recommendations

### For Employers
- Create and manage company profile
- Post and manage job listings
- Review and manage applicants
- Search candidate database
- Schedule interviews
- Company analytics dashboard

### For Administrators
- User management
- Company verification
- Content moderation
- Platform analytics
- Survey management
- System settings

## Project Structure

### Frontend
- `/src/pages`: Main application pages
- `/src/components`: Reusable UI components
- `/src/redux`: State management using Redux
- `/src/services`: API service integration
- `/src/api`: API client configurations
- `/src/hooks`: Custom React hooks
- `/src/utils`: Utility functions
- `/src/assets`: Static assets

### Backend
- `/src/main/java/com/job_portal/controller`: API endpoints
- `/src/main/java/com/job_portal/service`: Business logic
- `/src/main/java/com/job_portal/models`: Data models
- `/src/main/java/com/job_portal/repository`: Data access layer
- `/src/main/java/com/job_portal/config`: Application configuration
- `/src/main/java/com/job_portal/utils`: Utility classes
- `/src/main/resources`: Application properties and static resources

## License

This project is proprietary and confidential. 
"# JobRadar_" 
"# JobRadar_" 
