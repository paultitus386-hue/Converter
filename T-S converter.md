Build a complete, production-quality Text-to-Speech (TTS) and Speech-to-Text (STT) web application that runs entirely on localhost.

IMPORTANT: Work as an autonomous senior full-stack developer. First inspect the existing Antigravity workspace and understand the files that already exist. Do not blindly overwrite or duplicate existing files.

I have already created the required .md file in the Antigravity workspace.

DO NOT create, generate, duplicate, rename, or replace any .md file.

DO NOT create README.md or any other Markdown file.

If documentation or project instructions need to be referenced, use the existing .md file that is already present in the workspace. Do not create another Markdown file unless I explicitly ask you to.

After implementing the application, actually run it, test it in the browser, identify errors, and fix them. Do not simply describe the implementation. The final application must actually work.

========================================
PROJECT NAME
========================================

Voice Converter

========================================
GOAL
========================================

Create a single web application containing three main areas:

1. Text â†’ Speech
2. Speech â†’ Text
3. Recents / Storage

The application should have a modern, clean, responsive UI and should actually work, not just be a visual mockup.

The Recents / Storage feature should preserve previous voice-conversion sessions locally so the user can view and restore previous work later.

========================================
TECH STACK
========================================

Frontend:
- React + Vite
- Modern JavaScript/TypeScript
- Tailwind CSS

Backend:
- Python FastAPI

Other requirements:
- The application must run locally on localhost.
- Do not require deployment to an external server.
- Keep the architecture simple and easy to understand.
- Use reusable React components.
- Keep frontend and backend separated cleanly.

========================================
IMPORTANT FUNCTIONAL REQUIREMENTS
========================================

The application must function without requiring paid APIs.

Prefer browser-native APIs wherever possible.

For Text-to-Speech:
- Use the browser Web Speech API.
- Use window.speechSynthesis wherever supported.

For Speech-to-Text:
- Use the browser Speech Recognition API.
- Support both SpeechRecognition and webkitSpeechRecognition.

Do not pretend a feature works if the browser does not support it.

If a browser-native API is unavailable, clearly explain the limitation to the user and provide graceful fallback handling.

========================================
1. TEXT TO SPEECH
========================================

Create a Text-to-Speech section.

Features:

- Large textarea for entering text.
- Character counter.
- Word counter.
- Play / Speak button.
- Pause button.
- Resume button.
- Stop button.
- Clear button.
- Voice selection dropdown.
- Language selection.
- Speech speed control.
- Pitch control.
- Volume control.
- Show currently selected voice.
- Disable controls when they are not applicable.
- Show speaking status.

Use:

window.speechSynthesis

for TTS wherever supported.

The user should be able to:

- Type or paste text.
- Select a voice installed/available in the browser.
- Change language.
- Change speed.
- Change pitch.
- Change volume.
- Start speaking.
- Pause speaking.
- Resume speaking.
- Stop speaking.

Automatically populate the voice dropdown using:

speechSynthesis.getVoices()

Handle browsers where voices load asynchronously.

Listen for:

speechSynthesis.onvoiceschanged

and refresh the voice list when voices become available.

========================================
2. SPEECH TO TEXT
========================================

Create a Speech-to-Text section.

Features:

- Microphone button.
- Start recording/listening.
- Stop recording/listening.
- Live transcription.
- Final transcription.
- Clear transcription.
- Copy transcription.
- Download transcription as .txt.
- Language selection.
- Recording/listening status.
- Visual microphone animation while listening.

Use the browser Speech Recognition API where supported:

SpeechRecognition
webkitSpeechRecognition

Automatically detect which implementation is available.

If Speech Recognition is unavailable:

- Clearly display that the browser does not support speech recognition.
- Explain that the user can use a compatible browser.
- Do not crash the application.

Configure Speech Recognition with:

continuous = true
interimResults = true

Show interim speech results separately from finalized text whenever possible.

========================================
3. OPTIONAL BACKEND FALLBACK
========================================

Create a FastAPI backend that can be used as an optional future fallback for speech recognition.

Structure the project so that a future Whisper-based STT implementation can easily be added.

For now:

- Browser Speech Recognition should be the primary STT method.
- Do not force users to install large AI models just to run the application.
- Keep the backend lightweight.

Create a clean API structure such as:

POST /api/transcribe

The endpoint can be prepared for future audio-file transcription, even if browser STT is the primary method.

Do not make the current application dependent on a large AI model.

========================================
4. RECENTS / STORAGE
========================================

Add a dedicated "Recents" or "Storage" section to the webpage.

The purpose of this feature is to preserve the user's previous Text-to-Speech and Speech-to-Text work so that it can be viewed and reused later.

It should work similarly to a "Recents" or "History" section in modern applications.

STORAGE REQUIREMENTS:

- Add a clearly visible "Recents" / "Storage" section.
- Store previous Text-to-Speech and Speech-to-Text sessions locally.
- Use browser localStorage or IndexedDB.
- Do NOT require a database or external server for this feature.
- Stored data must remain available after refreshing the page.
- Stored data should remain available after closing and reopening the localhost application.
- Do not send stored session data to an external server.

Do NOT permanently store microphone recordings.

Store only text, transcription, settings, and session metadata.

For each session, store where applicable:

- Original text entered for Text-to-Speech.
- Final transcription from Speech-to-Text.
- Selected language.
- Selected voice for Text-to-Speech.
- Speech speed.
- Pitch.
- Volume.
- Date and time of the session.
- Session type:
  - Text-to-Speech
  - Speech-to-Text

RECENTS UI:

Create a dedicated Recents / Storage panel.

Each recent session should display:

- Session type.
- Short preview of the text or transcription.
- Date and time.
- Relevant language.
- An option to open/restore the session.
- Delete option.

When the user selects a previous session:

- Restore the saved text/transcription into the appropriate section.
- Restore the saved language.
- Restore the saved voice where applicable.
- Restore speech speed where applicable.
- Restore pitch where applicable.
- Restore volume where applicable.
- Allow the user to continue editing or using the restored data.

STORAGE CONTROLS:

Include:

- Open / Restore session.
- Delete individual session.
- Clear all stored sessions.
- Confirmation before clearing all sessions.
- Empty-state message when there are no previous sessions.

Example empty-state message:

"No recent sessions yet. Your previous voice conversions will appear here."

STORAGE BEHAVIOR:

- New completed sessions should automatically appear in Recents.
- Avoid creating duplicate entries unnecessarily.
- Limit the number of stored recent sessions to a reasonable amount, such as the latest 20 sessions.
- The newest sessions should appear first.
- Handle corrupted or unavailable stored data gracefully.
- Do not allow storage errors to crash the application.
- Keep the storage implementation modular and easy to maintain.
- Persist selected language/settings in localStorage.
- Persist dark/light mode in localStorage.

The Recents / Storage section must work in both light and dark mode.

The Recents / Storage section must be responsive on desktop and mobile.

========================================
5. USER INTERFACE
========================================

Create a professional dashboard-style interface.

HEADER:

- App name: "Voice Converter"
- Subtitle: "Convert text to speech and speech to text"
- Simple microphone / waveform icon.

MAIN INTERFACE:

Use a clean dashboard layout.

On desktop:

- Text-to-Speech card.
- Speech-to-Text card.
- Recents / Storage section.

The Recents / Storage area can be displayed as:
- A third card.
- A sidebar.
- A dedicated panel.

Choose the layout that provides the best usability while keeping the interface clean.

On mobile:

- Stack the sections vertically.
- Make all controls easy to use on smaller screens.

DESIGN:

- Modern minimal UI.
- Rounded cards.
- Subtle shadows.
- Good spacing.
- Accessible contrast.
- Smooth hover effects.
- Smooth transitions.
- Responsive layout.
- Professional typography.
- Clear visual hierarchy.

Add a light/dark mode toggle.

Persist the selected theme using localStorage.

========================================
6. TEXT TO SPEECH UI
========================================

Example layout:

TEXT TO SPEECH

[ Enter your text here... ]

Characters: 0
Words: 0

Voice:
[ Available Voice â–¼ ]

Language:
[ English (US) â–¼ ]

Speed:
[â”€â”€â”€â”€â”€â”€â—â”€â”€â”€â”€â”€â”€â”€â”€] 1.0x

Pitch:
[â”€â”€â”€â”€â”€â”€â—â”€â”€â”€â”€â”€â”€â”€â”€] 1.0

Volume:
[â”€â”€â”€â”€â”€â”€â”€â”€â—â”€â”€â”€â”€â”€â”€] 100%

[ â–¶ Speak ] [ â¸ Pause ] [ â–¶ Resume ] [ â–  Stop ]

Status:
Ready

Make the controls visually clear and accessible.

========================================
7. SPEECH TO TEXT UI
========================================

Example:

SPEECH TO TEXT

Language:
[ English (US) â–¼ ]

ðŸŽ™
[ Start Listening ]

Status:
Ready

LIVE TRANSCRIPTION

"Your speech will appear here..."

FINAL TRANSCRIPTION

Your finalized transcription will appear here.

[ Copy ] [ Download TXT ] [ Clear ]

While listening:

- Animate microphone icon.
- Change button to "Stop Listening".
- Display "Listening..."
- Display live interim words.
- Clearly distinguish interim text from finalized text.

========================================
8. RECENTS / STORAGE UI
========================================

Create a clean Recents / Storage interface.

Example:

RECENTS

[ Text â†’ Speech ]
"Hello, how are you..."
English (US)
Today, 6:30 PM
[ Restore ] [ Delete ]

[ Speech â†’ Text ]
"Today I learned..."
English (US)
Today, 5:45 PM
[ Restore ] [ Delete ]

[ Clear All ]

If there are no saved sessions:

"No recent sessions yet.
Your previous voice conversions will appear here."

Add appropriate icons for:

- Text-to-Speech.
- Speech-to-Text.
- Restore.
- Delete.
- Clear all.

Do not make the Recents panel unnecessarily large.

Allow scrolling when there are many sessions.

========================================
9. SUPPORTED LANGUAGES
========================================

Include a language selector with common languages such as:

English (US)
English (UK)
Hindi
Kannada
Tamil
Telugu
Malayalam
Bengali
Marathi
Gujarati
Punjabi
Urdu
French
German
Spanish
Italian
Portuguese
Japanese
Korean
Chinese

Use appropriate BCP-47 language codes:

en-US
en-GB
hi-IN
kn-IN
ta-IN
te-IN
ml-IN
bn-IN
mr-IN
gu-IN
pa-IN
ur-IN
fr-FR
de-DE
es-ES
it-IT
pt-BR
ja-JP
ko-KR
zh-CN

Make sure the selected language is correctly applied to both the Speech Recognition and Text-to-Speech functionality where supported.

Do not claim that every browser provides voices for every language.

If a language has no available browser voice, clearly communicate that to the user.

========================================
10. ERROR HANDLING
========================================

Handle all common errors gracefully.

Examples:

- Microphone permission denied.
- Microphone unavailable.
- Browser doesn't support SpeechRecognition.
- No voices available.
- Speech synthesis failed.
- Empty text.
- Recognition stopped unexpectedly.
- Network-related browser recognition errors.
- Local storage unavailable.
- Local storage corrupted.
- Invalid stored session data.

Never show raw JavaScript errors to the user.

Display friendly messages such as:

"Microphone permission is required to use Speech-to-Text."

"Speech recognition isn't supported by this browser."

"Please enter some text before starting Text-to-Speech."

"No suitable voice is available for the selected language."

"Your recent session could not be restored."

"Local storage is unavailable, so recent sessions cannot be saved."

========================================
11. ACCESSIBILITY
========================================

Include:

- Proper labels.
- Keyboard navigation.
- ARIA labels for buttons.
- Visible focus states.
- Accessible color contrast.
- Tooltips for unfamiliar controls.
- Buttons with both icons and accessible text.
- Accessible status messages.
- Proper semantic HTML where possible.

Make sure interactive elements can be used with keyboard navigation.

========================================
12. PROJECT STRUCTURE
========================================

Use a clean structure similar to:

voice-converter/
â”‚
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ Header
â”‚   â”‚   â”‚   â”œâ”€â”€ TextToSpeech
â”‚   â”‚   â”‚   â”œâ”€â”€ SpeechToText
â”‚   â”‚   â”‚   â”œâ”€â”€ VoiceControls
â”‚   â”‚   â”‚   â”œâ”€â”€ LanguageSelector
â”‚   â”‚   â”‚   â”œâ”€â”€ Recents
â”‚   â”‚   â”‚   â””â”€â”€ StorageManager
â”‚   â”‚   â”œâ”€â”€ App
â”‚   â”‚   â”œâ”€â”€ main
â”‚   â”‚   â””â”€â”€ styles
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ vite.config
â”‚
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ main.py
â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â””â”€â”€ transcription.py
â”‚   â””â”€â”€ requirements.txt
â”‚
â””â”€â”€ [DO NOT CREATE ANY .md FILES]

Use reusable React components rather than putting everything in one file.

Do not create unnecessary files.

Keep the code organized and maintainable.

========================================
13. LOCALHOST REQUIREMENTS
========================================

Make the application easy to start.

Frontend:

npm install
npm run dev

Backend:

python -m venv venv
pip install -r requirements.txt
uvicorn main:app --reload

The existing .md file in the workspace should contain or be used for any necessary project documentation.

DO NOT CREATE README.md.

Expected URLs:

Frontend:
http://localhost:5173

Backend:
http://localhost:8000

========================================
14. IMPORTANT BROWSER REQUIREMENTS
========================================

The application must work correctly with browser permissions.

For microphone access:

- Request microphone permission only when the user clicks Start Listening.
- Do not request microphone permission automatically on page load.

For speech synthesis:

- Load available voices correctly.
- Refresh the voice list when voiceschanged fires.

Clean up properly:

- Stop recognition when the component is unmounted.
- Cancel speech synthesis when the component is unmounted.
- Avoid memory leaks.
- Avoid duplicate event listeners.
- Clean up timers and event handlers.

For local storage:

- Handle unavailable localStorage gracefully.
- Handle malformed stored JSON gracefully.
- Do not crash if stored data is missing or corrupted.
- Keep storage logic isolated from the UI where practical.

========================================
15. EXTRA FEATURES
========================================

Add:

- Copy-to-clipboard button.
- Download transcription as TXT.
- Character counter.
- Word counter.
- Reset buttons.
- Toast notifications.
- Keyboard shortcuts where appropriate.
- Persist selected language/settings in localStorage.
- Persist dark/light mode in localStorage.
- Recents / Storage history.
- Restore previous sessions.
- Delete individual sessions.
- Clear all sessions.

Do NOT store microphone recordings permanently.

========================================
16. QUALITY REQUIREMENTS
========================================

Before considering the project complete:

1. Make sure there are no compilation errors.
2. Make sure there are no missing imports.
3. Make sure all buttons work.
4. Make sure Text-to-Speech actually speaks.
5. Make sure pause works.
6. Make sure resume works.
7. Make sure stop works.
8. Make sure Speech-to-Text actually listens.
9. Make sure interim transcription works.
10. Make sure final transcription works.
11. Make sure copy works.
12. Make sure TXT download works.
13. Test responsive layout.
14. Test dark mode.
15. Test microphone permission errors.
16. Test unsupported-browser handling.
17. Make sure frontend and backend can run independently.
18. Test Recents / Storage.
19. Test that completed TTS sessions are saved.
20. Test that completed STT sessions are saved.
21. Test that recent sessions survive a page refresh.
22. Test that recent sessions survive closing and reopening the localhost application.
23. Test restoring a previous session.
24. Test deleting an individual session.
25. Test Clear All.
26. Test the empty-state message.
27. Test restoring saved language/settings.
28. Test corrupted local storage handling.
29. Make sure microphone recordings are never permanently stored.
30. Make sure there are no duplicate event listeners.
31. Make sure there are no obvious console errors.
32. Test the application in a compatible browser.
33. Verify the application visually in the browser.
34. Fix any errors discovered during testing.
35. Do not leave placeholder functionality.
36. Do not leave unfinished TODO functionality unless it is explicitly described as future functionality.

========================================
17. ANTIGRAVITY EXECUTION INSTRUCTIONS
========================================

Do not only generate code and stop.

Follow this workflow:

1. Inspect the existing workspace.
2. Identify existing project files.
3. Do not create or duplicate any .md files.
4. Create or modify the required frontend and backend files.
5. Install the required dependencies.
6. Start the frontend.
7. Start the backend.
8. Open the application in the browser.
9. Test the main UI.
10. Test Text-to-Speech.
11. Test Speech-to-Text.
12. Test Recents / Storage.
13. Test restoring a previous session.
14. Test deleting sessions.
15. Test dark mode.
16. Test responsive behavior.
17. Check the browser console for errors.
18. Fix any issues found.
19. Re-run the application after fixes.
20. Verify that the final application is functional.

If something does not work because of a browser limitation, do not fake the functionality. Clearly handle the limitation in the application UI.

Use browser-native APIs whenever possible.

Do not introduce unnecessary external services or paid APIs.

========================================
18. FINAL DELIVERABLE
========================================

Generate all required source files for the application.

Provide:

- Complete frontend.
- Complete backend.
- package.json.
- requirements.txt.
- All required React components.
- All required configuration files.
- Working Recents / Storage functionality.
- Setup instructions using the existing .md file where appropriate.

IMPORTANT:

DO NOT CREATE README.md.

DO NOT CREATE ANY OTHER .md FILE.

I already have an .md file in the workspace.

The final result should be a polished localhost application that I can run after installing the dependencies.

The application should be functional rather than a visual mockup.

After completing the implementation and testing, give me a concise summary of:

- What was created.
- What features work.
- How to start the frontend.
- How to start the backend.
- Any browser limitations that were encountered.

Do not create any additional Markdown documentation file as part of the final deliverable.