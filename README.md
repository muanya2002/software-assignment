# CarSearch Application

## Project Setup

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB
- Google OAuth Credentials
- Openverse API Key

### Installation Steps

1. Clone the repository
```bash
git clone [https://your-repo-url.git](https://github.com/muanya2002/software-assignment.git)
cd carsearch-backend
```

2. Install dependencies
```bash
npm install
```

3. Configure Environment Variables
- Copy `.env.example` to `.env`
- Fill in the following details:
  - MongoDB Connection String
  - JWT Secret
  - Google OAuth Credentials
  - Openverse API Key

4. Start the Development Server
```bash
npm run dev
```

### API Endpoints

#### Authentication
- `POST /auth/register` - User Registration
- `POST /auth/login` - User Login
- `GET /auth/google` - Google OAuth Login
- `GET /auth/logout` - User Logout

#### Cars
- `GET /cars` - Search Cars
- `GET /cars/:id` - Get Car Details
- `POST /cars/favorite` - Add Car to Favorites

#### Openverse
- `GET /openverse/car-images` - Search Car Images

### Configuration Notes
- Ensure MongoDB is running
- Set up Google OAuth in Google Developer Console
- Obtain Openverse API Key

### Testing
```bash
npm test
```

### Deployment
- Set `NODE_ENV=production` 
- Configure environment-specific settings

### Technologies
- Express.js
- MongoDB
- Passport.js
- JWT Authentication
- Openverse API Integration
