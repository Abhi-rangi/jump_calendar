import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

// Required OAuth2 scopes for Gmail
const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify'
];

// Set up OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_OAUTH_CLIENT_ID,
  process.env.GMAIL_OAUTH_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

interface GoogleError extends Error {
  response?: {
    data?: unknown;
  };
  config?: unknown;
}

// Create transporter with OAuth2
async function createTransporter() {
  try {
    // Verify required environment variables
    const requiredEnvVars = {
      GMAIL_OAUTH_CLIENT_ID: process.env.GMAIL_OAUTH_CLIENT_ID,
      GMAIL_OAUTH_CLIENT_SECRET: process.env.GMAIL_OAUTH_CLIENT_SECRET,
      GMAIL_OAUTH_REFRESH_TOKEN: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
      SMTP_FROM: process.env.SMTP_FROM
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Log credentials (without sensitive data)
    console.log('OAuth2 Config:', {
      clientIdExists: !!process.env.GMAIL_OAUTH_CLIENT_ID,
      clientSecretExists: !!process.env.GMAIL_OAUTH_CLIENT_SECRET,
      refreshTokenExists: !!process.env.GMAIL_OAUTH_REFRESH_TOKEN,
      userEmail: process.env.SMTP_FROM
    });

    // Set credentials with scopes
    oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
      scope: GMAIL_SCOPES.join(' ')
    });

    // Get access token
    console.log('Requesting access token...');
    const accessToken = await oAuth2Client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to obtain access token');
    }
    console.log('Access Token Retrieved:', !!accessToken.token);

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_FROM,
        clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
        clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // Verify transporter
    console.log('Verifying transporter configuration...');
    await transporter.verify();
    console.log('Transporter verified successfully');

    return transporter;
  } catch (error) {
    const googleError = error as GoogleError;
    console.error('Error creating transporter:', {
      message: googleError.message,
      stack: googleError.stack,
      response: googleError.response?.data,
      config: googleError.config
    });
    throw new Error(`Failed to create email transporter: ${googleError.message}`);
  }
}

function toGoogleCalendarDateString(date: Date) {
  // Returns YYYYMMDDTHHmmssZ in UTC
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generateGoogleCalendarLink({
  clientName,
  start,
  end,
  description,
  clientEmail,
}: {
  clientName: string;
  start: Date;
  end: Date;
  description: string;
  clientEmail: string;
}) {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = [
    `text=${encodeURIComponent('Meeting with ' + clientName)}`,
    `dates=${toGoogleCalendarDateString(start)}/${toGoogleCalendarDateString(end)}`,
    `details=${encodeURIComponent(description)}`,
    `add=${encodeURIComponent(clientEmail)}`,
  ];
  return `${base}&${params.join('&')}`;
}

interface MeetingDetails {
  clientName: string;
  clientEmail: string;
  linkedin: string;
  date: Date;
  time: string;
  duration: number;
  answers?: Record<string, string>;
  link: {
    name: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
}

export async function sendMeetingNotificationToAdvisor(meeting: MeetingDetails) {
  try {
    // Ensure we have a valid email address for the advisor
    if (!meeting.link.user.email) {
      console.error('No advisor email provided');
      return;
    }

    const advisorName = meeting.link.user.name || 'Advisor';
    const formattedDate = meeting.date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    let additionalInfo = '';
    if (meeting.answers && Object.keys(meeting.answers).length > 0) {
      additionalInfo = '\n\nAdditional Information:\n' +
        Object.entries(meeting.answers)
          .map(([question, answer]) => `${question}: ${answer}`)
          .join('\n');
    }

    const emailContent = `
      Hello ${advisorName},

      A new meeting has been scheduled through your link "${meeting.link.name}".

      Meeting Details:
      - Client: ${meeting.clientName} (${meeting.clientEmail})
      - LinkedIn Profile: ${meeting.linkedin}
      - Date: ${formattedDate}
      - Time: ${meeting.time}
      - Duration: ${meeting.duration} minutes
      ${additionalInfo}

      You can view all your scheduled meetings in your dashboard.

      Best regards,
      Your Scheduling App
    `;

    // Calculate start and end times for the calendar event
    const start = new Date(meeting.date);
    const [time, modifier] = meeting.time.split(' ');
    let [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (hour === 12) {
      hour = modifier === 'PM' ? 12 : 0;
    } else {
      hour = modifier === 'PM' ? hour + 12 : hour;
    }
    start.setHours(hour, parseInt(minutes), 0, 0);
    const end = new Date(start.getTime() + meeting.duration * 60000);

    const calendarLink = generateGoogleCalendarLink({
      clientName: meeting.clientName,
      start,
      end,
      description: emailContent,
      clientEmail: meeting.clientEmail,
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${advisorName},</h2>
        
        <p>A new meeting has been scheduled through your link "${meeting.link.name}".</p>
        
        <h3>Meeting Details:</h3>
        <ul>
          <li><strong>Client:</strong> ${meeting.clientName} (${meeting.clientEmail})</li>
          <li><strong>LinkedIn Profile:</strong> <a href="${meeting.linkedin}">${meeting.linkedin}</a></li>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time:</strong> ${meeting.time}</li>
          <li><strong>Duration:</strong> ${meeting.duration} minutes</li>
        </ul>
        
        ${meeting.answers && Object.keys(meeting.answers).length > 0 ? `
          <h3>Additional Information:</h3>
          <ul>
            ${Object.entries(meeting.answers)
          .map(([question, answer]) => `<li><strong>${question}:</strong> ${answer}</li>`)
          .join('')}
          </ul>
        ` : ''}
        
        <p>You can view all your scheduled meetings in your <a href="${process.env.NEXTAUTH_URL}/dashboard/meetings">dashboard</a>.</p>
        <p><a href="${calendarLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:16px;padding:10px 18px;background:#4285F4;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Add to Google Calendar</a></p>
        <p>Best regards,<br>Your Scheduling App</p>
      </div>
    `;

    console.log('Creating email transporter...');
    const transporter = await createTransporter();
    console.log('Transporter created successfully');

    console.log('Sending email to:', meeting.link.user.email);
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '',
      to: meeting.link.user.email,
      subject: `New Meeting Scheduled: ${meeting.clientName}`,
      text: emailContent + `\n\nAdd to Google Calendar: ${calendarLink}`,
      html: htmlContent,
    });
    console.log('Email sent successfully');
  } catch (error) {
    const emailError = error as Error;
    console.error('Error sending meeting notification:', emailError);
    // Don't throw the error to prevent blocking the meeting creation
    // but log it for debugging
  }
} 