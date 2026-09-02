# Rayy’s Assistant — Web/PWA Build 3

This is a phone-friendly Progressive Web App designed for iPhone use without a Mac/Xcode.

Features:
- Goals with colorful progress
- Simple reminders
- Quick natural-language reminder entry
- Daily/weekly/monthly/custom repeats
- Location and notes
- Sound/vibration preference controls
- Calendar schedule
- Local browser storage

IMPORTANT:
For iPhone notifications, the app should be served over HTTPS and installed to the Home Screen from Safari. Notification behavior is controlled by iOS/Safari. The current MVP schedules notifications while the web app is active; reliable background recurring alarms require a native iOS app or a backend push-notification service.

To use from Windows:
1. Upload the entire folder to an HTTPS static host (GitHub Pages, Netlify, Vercel, etc.).
2. Open the HTTPS URL in Safari on iPhone.
3. Share -> Add to Home Screen.
4. Open the installed app and allow notifications.
