import { v4 as uuidv4 } from 'uuid';

export interface SchedulingLink {
    id: string;
    name: string;
    slug: string;
    duration: number;
    maxAdvanceDays: number | null;
    maxUses: number | null;
    expirationDate: string | null;
    createdAt: string;
    customQuestions: Array<{ id: string; text: string; }>;
    advisor: {
        name: string;
        email: string;
        image: string;
    };
}

export interface Meeting {
    id: string;
    linkId: string;
    linkName: string;
    clientName: string;
    clientEmail: string;
    linkedin: string;
    date: string;
    time: string;
    duration: number;
    advisorEmail: string;
    answers: Array<{
        questionId: string;
        answer: string;
    }>;
    createdAt: string;
}

class StorageManager {
    readonly STORAGE_KEY = 'scheduling_links';
    readonly MEETINGS_KEY = 'scheduled_meetings';
    private links: SchedulingLink[] = [];
    private meetings: Meeting[] = [];
    private initialized = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.initializeStorage();
        }
    }

    private initializeStorage() {
        if (this.initialized) return;

        try {
            // Initialize links storage
            const storedLinks = localStorage.getItem(this.STORAGE_KEY);
            if (!storedLinks) {
                console.log('Initializing empty links storage');
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
                this.links = [];
            } else {
                this.links = JSON.parse(storedLinks);
            }

            // Initialize meetings storage
            const storedMeetings = localStorage.getItem(this.MEETINGS_KEY);
            if (!storedMeetings) {
                console.log('Initializing empty meetings storage');
                localStorage.setItem(this.MEETINGS_KEY, JSON.stringify([]));
                this.meetings = [];
            } else {
                this.meetings = JSON.parse(storedMeetings);
            }

            this.initialized = true;
            console.log('Storage initialized successfully');
        } catch (error) {
            console.error('Error initializing storage:', error);
            this.links = [];
            this.meetings = [];
        }
    }

    private ensureInitialized() {
        if (!this.initialized && typeof window !== 'undefined') {
            this.initializeStorage();
        }
    }

    // Links methods
    getAllLinks(): SchedulingLink[] {
        this.ensureInitialized();
        return this.links;
    }

    getLinkBySlug(slug: string): SchedulingLink | null {
        this.ensureInitialized();
        return this.links.find(link => link.slug === slug) || null;
    }

    createLink(linkData: Omit<SchedulingLink, 'id' | 'createdAt'>): SchedulingLink {
        this.ensureInitialized();

        const newLink: SchedulingLink = {
            ...linkData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        this.links.push(newLink);

        if (typeof window !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.links));
        }

        return newLink;
    }

    deleteLink(id: string): boolean {
        this.ensureInitialized();
        const initialLength = this.links.length;
        this.links = this.links.filter(link => link.id !== id);

        if (typeof window !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.links));
        }

        return this.links.length < initialLength;
    }

    // Meetings methods
    getAllMeetings(): Meeting[] {
        this.ensureInitialized();
        return this.meetings;
    }

    getUpcomingMeetings(): Meeting[] {
        this.ensureInitialized();
        const now = new Date();
        return this.meetings
            .filter(meeting => {
                const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
                return meetingDate > now;
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA.getTime() - dateB.getTime();
            });
    }

    createMeeting(meetingData: Omit<Meeting, 'id' | 'createdAt'>): Meeting {
        this.ensureInitialized();

        const newMeeting: Meeting = {
            ...meetingData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        this.meetings.push(newMeeting);

        if (typeof window !== 'undefined') {
            localStorage.setItem(this.MEETINGS_KEY, JSON.stringify(this.meetings));
        }

        return newMeeting;
    }

    deleteMeeting(id: string): boolean {
        this.ensureInitialized();
        const initialLength = this.meetings.length;
        this.meetings = this.meetings.filter(meeting => meeting.id !== id);

        if (typeof window !== 'undefined') {
            localStorage.setItem(this.MEETINGS_KEY, JSON.stringify(this.meetings));
        }

        return this.meetings.length < initialLength;
    }
}

export const storage = new StorageManager(); 