// src/comp/announcementStore.js

const STORAGE_KEY = 'mockAnnouncements';

// --- Core LocalStorage Functions ---

// Function to get announcements from localStorage
export const getStoredAnnouncements = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Ensure it's an array and items have necessary fields (basic validation)
      if (Array.isArray(parsedData)) {
          return parsedData.filter(item => item && item.id && item.title && item.content && item.date);
      }
    }
  } catch (error) {
    console.error("Error reading announcements from localStorage:", error);
    localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
  }
  // Return default empty array if nothing stored or error occurred
  return [];
};

// Function to save announcements to localStorage
export const saveStoredAnnouncements = (announcements) => {
  try {
    if (!Array.isArray(announcements)) {
      throw new Error("Data to save must be an array.");
    }
    // Basic validation before saving
    const validAnnouncements = announcements.filter(item => item && item.id && item.title && item.content && item.date);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validAnnouncements));
  } catch (error) {
    console.error("Error saving announcements to localStorage:", error);
    // Decide if you want to throw the error or just log it
    // throw error;
  }
};

// --- Helper Functions ---

// Helper to generate a simple unique ID for mocks
export const generateMockId = () => `mock-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

// --- Initialization ---

// Function to initialize with default data ONLY if localStorage is empty
export const initializeDefaultAnnouncements = () => {
    if (localStorage.getItem(STORAGE_KEY) === null) { // Check if key specifically doesn't exist
        console.log("LocalStorage empty: Initializing default mock announcements...");
        const defaultAnnouncements = [
             {
                id: generateMockId(),
                title: 'System Maintenance Scheduled',
                content: 'Please be advised that the main student portal will undergo scheduled maintenance.\n\nDowntime is expected between 2:00 AM and 4:00 AM EST this Friday.\n\nWe apologize for any inconvenience.',
                date: new Date('2023-05-15T08:00:00Z').toISOString(),
                author: 'IT Department',
                isImportant: true
            },
            {
                id: generateMockId(),
                title: 'Welcome to the New Platform!',
                content: 'We are excited to launch the updated platform.\n\nPlease explore the new features and feel free to provide feedback to the support team.',
                date: new Date('2023-05-10T10:30:00Z').toISOString(),
                author: 'Admin Team',
                isImportant: false
            },
            {
                id: generateMockId(),
                title: 'Library Hour Changes',
                content: 'Starting next week, the main library will close at 10:00 PM on weekdays instead of 11:00 PM.',
                date: new Date('2023-05-08T14:00:00Z').toISOString(),
                author: 'Library Services',
                isImportant: false
            }
        ];
        // Sort before saving initially
        const sortedDefaults = defaultAnnouncements.sort((a, b) => new Date(b.date) - new Date(a.date));
        saveStoredAnnouncements(sortedDefaults);
        return sortedDefaults; // Return the initialized data
    }
    return getStoredAnnouncements(); // Return existing data if already present
};

// You can call initializeDefaultAnnouncements() once when your app starts,
// for example in index.js or App.js, to ensure data exists.