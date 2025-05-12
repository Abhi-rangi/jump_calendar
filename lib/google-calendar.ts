import { google } from 'googleapis';

export async function getGoogleCalendarEvents(accessToken: string, timeMin?: Date, timeMax?: Date) {
    try {
        const calendar = google.calendar({
            version: 'v3',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const now = new Date();
        const defaultTimeMin = new Date(now);
        defaultTimeMin.setDate(now.getDate() - 7); // Last 7 days
        const defaultTimeMax = new Date(now);
        defaultTimeMax.setDate(now.getDate() + 30); // Next 30 days

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: (timeMin || defaultTimeMin).toISOString(),
            timeMax: (timeMax || defaultTimeMax).toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items?.map(event => ({
            id: event.id,
            title: event.summary,
            description: event.description,
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            attendees: event.attendees,
            location: event.location,
            status: event.status,
            htmlLink: event.htmlLink,
        })) || [];
    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
        throw error;
    }
}

export async function checkAvailability(accessToken: string, startTime: Date, endTime: Date) {
    try {
        const events = await getGoogleCalendarEvents(accessToken, startTime, endTime);
        return events.length === 0;
    } catch (error) {
        console.error('Error checking availability:', error);
        throw error;
    }
}

export async function createCalendarEvent(
    accessToken: string,
    meeting: {
        clientName: string;
        date: string;
        time: string;
        duration: number;
        email: string;
        advisorEmail: string;
        description?: string;
    }
) {
    try {
        console.log('Creating calendar event with access token:', !!accessToken);

        const calendar = google.calendar({
            version: 'v3',
            auth: accessToken, // Changed from headers to auth
        });

        // Parse time properly handling AM/PM
        const [time, modifier] = meeting.time.split(' ');
        let [hours, minutes] = time.split(':');
        let hour = parseInt(hours);

        // Convert 12-hour format to 24-hour format
        if (hour === 12) {
            hour = modifier === 'PM' ? 12 : 0;
        } else {
            hour = modifier === 'PM' ? hour + 12 : hour;
        }

        // Get the user's timezone
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Parse the date components
        const [year, month, day] = meeting.date.split('-').map(num => parseInt(num));

        // Create a Date object in the local timezone
        const startTime = new Date(year, month - 1, day, hour, parseInt(minutes));
        const endTime = new Date(startTime.getTime() + meeting.duration * 60000);

        console.log('Calendar event details:', {
            date: meeting.date,
            time: meeting.time,
            parsedHour: hour,
            parsedMinutes: minutes,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            timeZone: userTimeZone,
            attendeeEmail: meeting.email,
            organizerEmail: meeting.advisorEmail
        });

        const event = {
            summary: `Meeting with ${meeting.clientName}`,
            description: meeting.description || 'Scheduled meeting via AdvisorConnect',
            start: {
                dateTime: startTime.toISOString(),
                timeZone: userTimeZone,
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: userTimeZone,
            },
            attendees: [
                { email: meeting.email },
                { email: meeting.advisorEmail }
            ],
            guestsCanModify: false,
            guestsCanInviteOthers: false,
            reminders: {
                useDefault: true
            },
        };

        console.log('Sending calendar event creation request...');
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            sendUpdates: 'all', // Ensures all attendees get email notifications
            conferenceDataVersion: 1, // Enable Google Meet integration
        });
        console.log('Calendar event created successfully:', response.data.htmlLink);

        return response.data;
    } catch (error) {
        console.error('Error creating calendar event:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            accessTokenExists: !!accessToken,
            meetingDetails: {
                clientName: meeting.clientName,
                date: meeting.date,
                time: meeting.time,
                duration: meeting.duration,
                hasEmail: !!meeting.email,
                hasAdvisorEmail: !!meeting.advisorEmail,
            }
        });
        throw error;
    }
} 