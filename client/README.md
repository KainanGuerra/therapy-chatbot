# Therapy Chatbot Frontend

A modern, responsive React TypeScript frontend for the Therapy Chatbot application. Built with React, TypeScript, styled-components, and modern UI/UX principles.

## Features

- 🎨 **Modern UI/UX**: Beautiful, responsive design with smooth animations
- 🔐 **Authentication**: Secure login/register with JWT tokens
- 💬 **Real-time Chat**: Interactive chat interface with mood analysis
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🎯 **TypeScript**: Full type safety and excellent developer experience
- 🎨 **Styled Components**: CSS-in-JS with theming support
- 🔄 **State Management**: Context API for global state management
- 🛡️ **Protected Routes**: Route guards for authenticated pages

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better developer experience
- **React Router DOM** - Client-side routing
- **Styled Components** - CSS-in-JS styling solution
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful, customizable icons
- **Date-fns** - Modern date utility library

## Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ChatInterface.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ChatPage.tsx
│   ├── context/          # React contexts
│   │   └── AuthContext.tsx
│   ├── services/         # API services
│   │   └── api.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── styles/          # Global styles and theme
│   │   └── GlobalStyles.ts
│   ├── hooks/           # Custom React hooks (future)
│   ├── App.tsx          # Main app component
│   └── index.tsx        # App entry point
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend server running on http://localhost:3001

### Installation

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env with your configuration
   REACT_APP_API_URL=http://localhost:3001
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to http://localhost:3000

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## Features Overview

### Authentication System
- **Login/Register**: Beautiful forms with validation
- **JWT Token Management**: Automatic token handling
- **Protected Routes**: Route guards for authenticated pages
- **Persistent Sessions**: Remember user login state

### Chat Interface
- **Real-time Messaging**: Send and receive messages
- **Mood Analysis**: Visual mood indicators on messages
- **Message History**: Persistent chat history
- **Typing Indicators**: Loading states for better UX
- **Responsive Design**: Works on all screen sizes

### UI/UX Features
- **Modern Design**: Clean, professional interface
- **Smooth Animations**: Fade-in, slide-in effects
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time form validation
- **Accessibility**: Keyboard navigation and screen reader support

## API Integration

The frontend communicates with the NestJS backend through a comprehensive API service:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/validate` - Token validation
- `POST /auth/logout` - User logout

### Chat Endpoints
- `POST /chat/send` - Send message
- `GET /chat/sessions` - Get chat sessions
- `POST /chat/sessions` - Create new session

### Professional & Habits Endpoints
- `GET /professionals` - Get mental health professionals
- `GET /habits/suggestions` - Get habit suggestions
- `POST /habits/track` - Track habit completion

## Styling and Theming

The app uses styled-components with a comprehensive theme system:

### Theme Structure
```typescript
const theme = {
  colors: {
    primary: '#4299e1',
    secondary: '#38b2ac',
    success: '#48bb78',
    warning: '#ed8936',
    error: '#f56565',
    gray: { /* 50-900 scale */ }
  },
  spacing: { /* xs to 3xl */ },
  borderRadius: { /* sm to full */ },
  shadows: { /* sm to xl */ },
  breakpoints: { /* sm to xl */ }
}
```

### Responsive Design
- Mobile-first approach
- Flexible layouts with CSS Grid and Flexbox
- Responsive typography and spacing
- Touch-friendly interface elements

## State Management

### AuthContext
Manages user authentication state:
- User information
- Authentication status
- Login/logout functions
- Token management

### Future Enhancements
- Chat context for message history
- Theme context for dark/light mode
- Notification context for alerts

## Performance Optimizations

- **Code Splitting**: Lazy loading of routes
- **Memoization**: React.memo for expensive components
- **Optimized Images**: Proper image optimization
- **Bundle Analysis**: Webpack bundle analyzer integration

## Security Features

- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Secure API communication
- **JWT Security**: Proper token storage and validation
- **Route Protection**: Authentication guards

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow React hooks patterns
- Use styled-components for styling
- Implement proper error boundaries

### Component Structure
```typescript
// Component structure example
const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => {};
  
  // Render
  return <div>Component content</div>;
};
```

### Testing Strategy
- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests with Cypress (future)

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set these in your production environment:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_APP_NAME` - Application name

### Hosting Options
- **Netlify**: Easy deployment with Git integration
- **Vercel**: Optimized for React applications
- **AWS S3 + CloudFront**: Scalable static hosting
- **Docker**: Containerized deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.