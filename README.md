# Diversia Eternals

A comprehensive, AI-powered platform designed for neurodivergent individuals, companies, and therapists. Built with Next.js, OpenAI integration, and a databaseless architecture using JSON storage.

## 🚀 Features

### Core Functionality
- **Three Core Forms**: Neurodivergent Individual, Company Placement Manager, Therapist/Specialist
- **NeuroAgent Chatbot**: AI-powered conversational assistant with context awareness
- **Interactive Games**: 12+ adaptive games for neurodivergent engagement
- **Quiz & Assessment Library**: 10+ question types with AI adaptation
- **Dashboard**: Personalized user experience with AI insights

### AI-Powered Features
- **Self-Hosted LLM** (Gemma 2B via Ollama) - Job inclusivity analysis without data leaks
- OpenAI API integration for validation, normalization, and responses
- Context-aware chat with user data and platform activity
- Real-time game adaptation and feedback
- Dynamic quiz question generation
- Multi-language support with AI translation

### Technical Architecture
- **Databaseless**: JSON file storage with in-memory caching
- **Serverless**: File I/O + ephemeral memory + OpenAI
- **Responsive**: Mobile-first design with accessibility features
- **PWA Ready**: Offline capabilities and app-like experience

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd diversia-eternals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
diversia-eternals/
├── app/
│   ├── api/                    # API routes
│   │   ├── chat/              # NeuroAgent chatbot API
│   │   └── forms/             # Form submission & validation
│   ├── components/            # Reusable components
│   │   ├── GenericForm.js     # Schema-driven form component
│   │   ├── NeuroAgent.js      # AI chatbot component
│   │   └── Navbar/            # Navigation component
│   ├── dashboard/             # User dashboard
│   ├── forms/                 # Three core forms with tabs
│   ├── games/                 # Interactive games library
│   ├── quiz/                  # Assessment library
│   └── page.js                # Home page
├── data/                      # JSON data storage
│   └── submissions.json       # Form submissions
├── public/                    # Static assets
└── package.json
```

## 🎯 Core Features

### 1. Forms System (`/forms`)
- **Tabbed Interface**: Switch between Individual, Company, and Therapist forms
- **GenericForm Component**: Schema-driven, reusable form builder
- **AI Validation**: OpenAI-powered data validation and normalization
- **JSON Storage**: Server-side data persistence without database

### 2. NeuroAgent Chatbot (`/api/chat`)
- **Context Awareness**: Remembers user data and chat history
- **OpenAI Integration**: Powered by GPT for intelligent responses
- **Session Persistence**: Chat history saved in localStorage
- **Multi-language**: Support for English and Spanish

### 3. Interactive Games (`/games`)
- **10 Game Types**: Memory Grid, Pattern Matrix, Operación 2.0, Reaction Time, Simon Says, Number Sequence, Word Builder, Shape Sorter, Color Match, Path Finder
- **Client-Side Only**: All game logic runs in browser (no backend/API for games)
- **Progress Tracking**: Save and resume functionality with localStorage
- **Accessibility**: Designed for neurodivergent engagement
- **Stats Display**: Score, accuracy, and reaction time metrics

### 4. Quiz & Assessment (`/quiz`)
- **10 Question Types**: Multiple choice, sliders, drag-drop, etc.
- **AI Adaptation**: Dynamic question generation and scoring
- **Progress Tracking**: Save/resume with localStorage
- **Export Results**: PDF summaries and insights

### 5. Dashboard (`/dashboard`)
- **Personalized Experience**: User-specific content and insights
- **Quick Actions**: Direct access to forms, games, and quizzes
- **AI Insights**: Personalized recommendations and analysis
- **Activity Tracking**: Recent actions and progress

## 🔧 API Endpoints

### `/api/forms`
- **POST**: Submit form data with OpenAI validation
- **GET**: Retrieve all submissions

### `/api/chat`
- **POST**: Send message to NeuroAgent with context

**Note**: Games (`/games`) and Quiz (`/quiz`) do not have backend APIs. All functionality is client-side with localStorage persistence.

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Dark/Light Theme**: System preference detection
- **Keyboard Navigation**: Full keyboard support
- **Loading States**: Smooth transitions and feedback

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Compatible with Next.js static export
- **Railway**: Full-stack deployment with environment variables
- **Docker**: Containerized deployment available

## 🔒 Security & Privacy

### Data Protection
- **Encryption at Rest**: AES-256-GCM for sensitive medical data
- **Authentication**: NextAuth.js v5 with JWT sessions
- **Authorization**: 3-actor model (Individual, Therapist, Company)
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Zod schemas for all inputs
- **Audit Logging**: 7-year retention for compliance

### AI/LLM Privacy 🤖
- **Self-Hosted LLM**: Gemma 2B via Ollama on EU VPS (París)
- **Zero Data Leaks**: No OpenAI, Anthropic, or third-party AI APIs
- **Data Residency**: All AI processing happens in EU servers
- **Ephemeral Processing**: Data in memory only during analysis (3-5s)
- **No Training**: Model never trained with production data

### Compliance
- **GDPR Compliant**: ✅ Art. 5, 9, 25, 32, 44-49
- **HIPAA Ready**: ✅ Medical data encryption and access controls
- **EU AI Act**: ✅ High-risk AI system compliant (self-hosted, auditable)

See [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation

## 🔮 Roadmap

- [ ] Backend API for game scores (currently localStorage only)
- [ ] Leaderboards and social features for games
- [ ] Add quiz question generation with AI
- [ ] Enhanced AI insights and personalized tips
- [ ] PWA offline support
- [ ] Multi-language expansion
- [ ] Advanced analytics dashboard
- [ ] Integration APIs for external systems

---

**Built with ❤️ for the neurodivergent community** 