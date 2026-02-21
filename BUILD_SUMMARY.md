# NeuroCare AI - Build Complete

## Project Overview
A fully functional, AI-powered cognitive health screening web application designed specifically for elderly users. The application provides interactive cognitive, speech, and behavioral assessments with a calm, supportive interface.

## Architecture

### Frontend Structure
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4 with medical blue (#2C5AA0) and light green (#6FB77D) color palette
- **State Management**: localStorage for user sessions and test history
- **Component Organization**: 20+ specialized components organized by feature

### Backend API Routes
- `/api/generate-reading-text` - Generates daily reading passages for speech tests
- `/api/speech-analysis` - Analyzes microphone audio via OpenAI Whisper API
- `/api/generate-meditation` - Creates new meditation stories for relaxation mode

## Core Features

### 1. Authentication System
- Email/password signup and login
- Simple user profile (name, age)
- Session persistence via localStorage
- Logout functionality

### 2. Cognitive Test (3 Games)
**Word Recall Game**
- Shows 5 words for 10 seconds
- Tests ability to recall words later
- Measures accuracy and response delay

**Pattern Recall Game** 
- 4x4 grid light-up sequence
- User repeats the pattern
- Measures accuracy and completion time

**Reaction Time Test**
- Screen changes color randomly
- User clicks as fast as possible
- Measures reaction time variability

**Output**: Cognitive Score (0-100)

### 3. Speech Test
- Fetches new reading passage from API
- Records microphone input using MediaRecorder
- Sends audio to OpenAI Whisper API for transcription
- Analyzes: WPM, pause frequency, silence, filler words, fluency
- Returns Speech Stability Score (0-100)

### 4. Behavior Analysis (3 Tests)
**Tap Rhythm Stability**
- 20 seconds of tapping
- Measures interval consistency using standard deviation

**Target Precision**
- Click on moving targets
- Measures distance accuracy from center

**Typing Rhythm**
- Type a sentence
- Measures keystroke timing variation

**Output**: Behavior Score (0-100) = average of 3 sub-tests

### 5. Results Dashboard
- **Results Locking**: Accessible only after all 3 tests complete
- **CSI Calculation**: Weighted average of cognitive, speech, and behavior scores
- **Risk Categories**: Stable / Mild / Concerning / High Risk
- **Visual Display**: Animated circular progress indicator with risk color coding
- **Report Generation**: Download text report with all metrics
- **Insights**: Shows weakest domain and retest suggestions

### 6. Relax Mode & Meditation
- Generates new calming story each session
- Uses Web Speech API for AI narration (can be replaced with OpenAI TTS)
- Breathing animation (4-4-2-2 rhythm: inhale, hold, exhale, hold)
- Mood feedback buttons (calm, peaceful, refreshed, relaxed)
- Soothing ambient music visualization

## Data Storage
All data stored in localStorage:
```
- User profile (id, name, age, email)
- Test results (cognitive, speech, behavior, timestamp)
- CSI history (scores over time)
- Meditation sessions (timestamp, duration, mood)
```

## UI/UX Design
- **Target**: Elderly users (60+)
- **Typography**: 48px+ buttons, large readable text
- **Colors**: White background, soft medical blue, light green accents
- **Accessibility**: 
  - High contrast text
  - Large tap targets
  - Minimal typing required
  - Clear progress indicators
  - Voice-friendly interface
- **Responsive**: Mobile-first design (1-2 screens per page)
- **Animations**: Gentle, slow animations (breathing circle, pulse effects)

## Navigation Structure
Top Navigation (persistent):
- Dashboard (home)
- Cognitive Test
- Speech Test
- Behavior Analysis
- Relax
- Results (locked until all tests complete)

## Component Hierarchy
```
Layout
├── Navigation
├── Auth Pages
│   ├── Login
│   └── Signup
├── Dashboard
├── Test Pages
│   ├── CognitiveTest
│   │   ├── WordRecallGame
│   │   ├── PatternRecallGame
│   │   └── ReactionTimeGame
│   ├── SpeechTest
│   ├── BehaviorAnalysis
│   │   ├── TapRhythmTest
│   │   ├── TargetPrecisionTest
│   │   └── TypingRhythmTest
│   └── RelaxPage
│       └── MeditationSession
├── Results
└── Utilities
    ├── Storage (localStorage management)
    ├── Scoring (CSI calculation)
    └── Auth (user management)
```

## Scoring System

### Cognitive Score
- Average of 3 game scores (0-100)

### Speech Score
- Based on: WPM, pause frequency, silence detection, filler words, fluency
- Penalizes significantly for detected silence

### Behavior Score
- Average of: tap rhythm (60%), target precision (40%)
- For typing: measures consistency and accuracy

### CSI (Cognitive Stability Index)
- Formula: `(Cognitive × 0.4) + (Speech × 0.35) + (Behavior × 0.25)`
- Range: 0-100
- Risk Categories:
  - 75-100: Stable
  - 50-74: Mild
  - 25-49: Concerning
  - 0-24: High Risk

## Key Implementation Details

### LocalStorage Data Structure
```javascript
{
  // User Profile
  "neurocare_user": { id, name, age, email },
  
  // Test Results
  "neurocare_result_cognitive": { score, metrics, timestamp },
  "neurocare_result_speech": { score, metrics, timestamp },
  "neurocare_result_behavior": { score, metrics, timestamp },
  
  // History
  "neurocare_csi_history": [{ csi, cognitive, speech, behavior, timestamp }],
  "neurocare_meditation_history": [{ timestamp, duration, mood }],
}
```

### Environment Variables Required
- `OPENAI_API_KEY` (for Whisper API and optional TTS)

### API Integration Points
1. **OpenAI Whisper** - Speech transcription
2. **Web Speech API** - Text-to-speech for meditation narration
3. **MediaRecorder API** - Audio recording

## Accessibility Features
- Semantic HTML with proper ARIA roles
- Large readable fonts throughout
- High contrast color scheme
- Voice narration support
- Keyboard navigation compatible
- Mobile browser compatible
- Progress indicators on all test pages
- Clear confirmation messages

## Performance Optimizations
- Client-side data persistence (no server calls for storage)
- Efficient game state management
- Smooth animations with CSS transforms
- Minimal re-renders with React hooks
- Mobile-optimized layouts

## Testing the App
1. **Register**: Sign up with email and age
2. **Cognitive Test**: Complete all 3 games (~5 min)
3. **Speech Test**: Read passage aloud (~2 min)
4. **Behavior Analysis**: Complete 3 quick tests (~3 min)
5. **View Results**: See CSI score and risk category
6. **Relax**: Try the meditation session
7. **Download Report**: Export your assessment results

## Future Enhancements
- Backend database integration (Supabase/Neon)
- User accounts with cloud sync
- Historical trend analysis
- Care provider sharing
- Multi-language support
- Wearable device integration
- Mobile app version
- Personalized recommendations
- Professional dashboard for clinicians
