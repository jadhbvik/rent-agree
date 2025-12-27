# Rent Agreement Management System

A full-stack Next.js application for managing rent and sale agreements with SMS alerts.

## Features

- ✅ Rent Agreement Form with file uploads
- ✅ Sale Agreement Form with file uploads
- ✅ Admin Dashboard with authentication
- ✅ Data tables with search and sort functionality
- ✅ File download capabilities
- ✅ SMS alerts for expiring agreements (Twilio integration)
- ✅ Responsive design

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Twilio SMS Setup (Production)

1. **Sign up for Twilio**: Go to [https://www.twilio.com/](https://www.twilio.com/) and create a free account
2. **Get your credentials** from the Twilio Console:
   - Account SID (starts with AC...)
   - Auth Token
   - Phone Number (purchase one or use trial number)
3. **Configure environment variables** in `.env.local`:

```env
TWILIO_ACCOUNT_SID=your_actual_account_sid
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. For Testing (Optional)

- Add verified phone numbers in your Twilio account for testing
- Use E.164 format for phone numbers (+1234567890)

### 4. Run the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## SMS Alert System

### Demo Mode (No Twilio Setup)
- SMS alerts are logged to console
- Shows "Demo Mode" in admin panel

### Production Mode (With Twilio)
- Real SMS sent via Twilio API
- Shows "Production (Twilio)" in admin panel
- Actual SMS delivery to mobile numbers

### Alert Triggers
- **Automatic**: Daily at 9 AM (cron job)
- **Manual**: Via "Send SMS Alerts" button in admin panel
- **Manual Check**: Via "Manual Check" button for testing
- **Detection**: Agreements expiring within 7 days

### Automatic SMS System
- **Schedule**: Daily at 9:00 AM
- **Duplicate Prevention**: Tracks sent alerts to avoid spam
- **Error Handling**: Continues processing even if some SMS fail
- **Logging**: Detailed console logs for monitoring

## Admin Access

- **URL**: `/admin`
- **Password**: `admin123` (change in production)
- **Features**:
  - View all agreements in tables
  - Search and sort functionality
  - Click rows for detailed view
  - Download agreement files
  - Send SMS alerts for expiring agreements

## API Endpoints

- `POST /api/rent` - Submit rent agreements
- `POST /api/submit` - Submit sale agreements
- `GET /api/rent` - Get all rent agreements
- `GET /api/submit` - Get all sale agreements
- `POST /api/send-sms` - Send SMS alerts

## File Storage

- Uploaded files are stored in `public/uploads/`
- Files are accessible via `/uploads/filename`
- Unique filenames prevent conflicts

## Security Notes

- Change the default admin password in production
- Use HTTPS in production
- Validate and sanitize all inputs
- Consider rate limiting for SMS API

## Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **SMS**: Twilio (production) / Console logging (demo)
- **File Handling**: Node.js fs API
- **State Management**: React hooks

## License

MIT License
