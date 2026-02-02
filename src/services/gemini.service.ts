/**
 * VisionFlow AI - Gemini Service
 * AI-powered image analysis for reminders and patterns
 * 
 * @module services/gemini
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AIReminderAnalysis, ReminderCategory } from '../types/reminder.types';
import { AIPatternAnalysis, PatternType } from '../types/pattern.types';
import { API_CONFIG, AI_CONFIG } from '../constants/config';

/**
 * Gemini service error
 */
class GeminiError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * Initialize Gemini AI
 */
function initializeGemini(): GoogleGenerativeAI {
  if (!API_CONFIG.gemini.apiKey) {
    throw new GeminiError(
      'Gemini API key is not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.',
      'MISSING_API_KEY'
    );
  }
  
  return new GoogleGenerativeAI(API_CONFIG.gemini.apiKey);
}

/**
 * Prepare base64 image for Gemini (remove data URL prefix)
 */
function prepareImageData(base64Image: string): string {
  return base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
}

/**
 * Retry logic for API calls
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = API_CONFIG.gemini.maxRetries
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on authentication errors
      if (error?.message?.includes('API_KEY') || error?.status === 401) {
        throw error;
      }
      
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// ============================================
// REMINDER ANALYSIS
// ============================================

/**
 * System instruction for reminder extraction
 */
function getReminderSystemInstruction(currentDate: string): string {
  return `You are an intelligent, human-like assistant for "VisionFlow AI". Your goal is to analyze images and extract structured, actionable reminder data with high precision.

Input: Image + Current Date/Time: ${currentDate}
Output: Strict JSON object only.

### 1. AUTO-CLASSIFICATION & SUBCATEGORIES

Analyze the image text and visual context to strictly map to one of these Categories:

- **Money** 💰: [Loan Given, Loan Taken, Credit Card Payment, EMI, Rent, Salary, Investment]
  Use for: Personal financial transactions, debts, earnings
  
- **Work** 💼: [Boss Task, Client Project, Meeting, Call, Deadline, Office Note]
  Use for: Professional/job-related tasks
  
- **Health** ❤️: [Medicine Schedule, Doctor Appointment, Lab Test, Prescription, Follow-up]
  Use for: Medical needs, prescriptions, health tracking
  
- **Study** 📚: [Exam, Assignment, Project, Class Schedule, Timetable, Self Study]
  Use for: Academic/education context
  
- **Personal** 🏠: [Shopping List, Daily Task, Personal Note, Hobby, Journal]
  Use for: General personal life items
  
- **Travel** ✈️: [Flight Ticket, Train Ticket, Hotel Booking, Packing List, Visa, Itinerary]
  Use for: Travel plans and bookings
  
- **Home & Utilities** 🛠️: [Electricity Bill, Water Bill, Gas Refill, Appliance Service, Maintenance, Repair]
  Use for: Household bills and upkeep
  
- **Legal & Documents** 📄: [Insurance Expiry, Warranty, License Renewal, Tax Filing, ID Renewal, Policy]
  Use for: Official documents and legal deadlines
  
- **Business & Finance** 📊: [Vendor Payment, Inventory, Sales Report, GST Filing, Business Meeting, Invoice]
  Use for: Business owners/admin tasks
  
- **Family & Kids** 👨‍👩‍👧: [School Event, Vaccination, Pocket Money, Birthday, Parent Care, Kids Activity]
  Use for: Family-related activities
  
- **Fitness** 🏋️: [Workout Plan, Gym Schedule, Diet Plan, Step Goal, Yoga Class]
  Use for: Fitness and exercise
  
- **Events & Occasions** 🎉: [Festival, Wedding, Party, Concert, Celebration, Anniversary]
  Use for: Special events and celebrations

### 2. PROJECT GROUPING

Identify a logical **projectName** to group this reminder:
- Credit Card Bill → "HDFC Bank" or "Finances"
- Physics Exam → "Sem 2 Exams"
- Home Renovation Quote → "Dream Home"
- Doctor Prescription → "Mom's Health"
- Keep names short (max 20 characters)

### 3. SMART CONTENT EXTRACTION (Critical)

**title**: Action-oriented and specific (max 60 chars)
- Examples: "Pay Electricity Bill", "Submit History Assignment", "Take Blood Pressure Medicine"

**smartNote**: Natural, human-like summary (1-2 lines). SYNTHESIZE information:
- Bad: "Pay bill 500 date 10th"
- Good (Bill): "Electricity bill of ₹500 is due. Pay before Friday to avoid late fees."
- Good (Medicine): "Take 1 Dolo-650 pill after lunch and dinner for 3 days."
- Good (Loan): "You lent ₹5,000 to Rahul. Remind him to pay back by the 25th."
- Good (Event): "Wedding reception at Grand Hotel on Sunday, 7 PM. Dress code: formal."

**reminderDate** & **reminderTime**: 
- Infer from text RELATIVE to current date: ${currentDate}
- If multiple dates exist, pick earliest upcoming deadline
- If STRICTLY undefined, default to tomorrow at 09:00
- Format: YYYY-MM-DD and HH:MM (24-hour)

**emoji**: MUST match the category emoji from Section 1

### 4. OUTPUT FORMAT

Return ONLY valid JSON. No markdown, no explanations.`;
}

/**
 * Response schema for reminder analysis (FIXED TYPE ANNOTATIONS)
 */
const reminderResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: {
      type: SchemaType.STRING,
      enum: Object.values(ReminderCategory),
      description: 'One of the 12 predefined categories',
    },
    subcategory: {
      type: SchemaType.STRING,
      description: 'Specific subcategory (e.g., "Loan Given", "Meeting")',
    },
    projectName: {
      type: SchemaType.STRING,
      description: 'Logical grouping name (max 20 chars)',
    },
    title: {
      type: SchemaType.STRING,
      description: 'Action-oriented title (max 60 chars)',
    },
    smartNote: {
      type: SchemaType.STRING,
      description: 'Natural 1-2 line summary',
    },
    reminderDate: {
      type: SchemaType.STRING,
      description: 'YYYY-MM-DD format',
    },
    reminderTime: {
      type: SchemaType.STRING,
      description: 'HH:MM 24-hour format',
    },
    emoji: {
      type: SchemaType.STRING,
      description: 'Category-matching emoji',
    },
  },
  required: ['category', 'subcategory', 'projectName', 'title', 'smartNote', 'reminderDate', 'reminderTime', 'emoji'],
} as const;

/**
 * Analyze image for reminder extraction
 */
export async function analyzeReminderImage(base64Image: string): Promise<AIReminderAnalysis> {
  try {
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({
      model: API_CONFIG.gemini.reminderModel,
    });
    
    const currentDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const cleanImage = prepareImageData(base64Image);
    
    const result = await retryOperation(async () => {
      return await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: `Current Date and Time: ${currentDate}\n\nAnalyze this image and extract reminder data.` },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanImage,
              },
            },
          ],
        }],
        systemInstruction: getReminderSystemInstruction(currentDate),
        generationConfig: {
          temperature: AI_CONFIG.reminder.temperature,
          maxOutputTokens: AI_CONFIG.reminder.maxTokens,
          responseMimeType: 'application/json',
          responseSchema: reminderResponseSchema as any, // Type assertion to fix strict type check
        },
      });
    });
    
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new GeminiError(
        'No response received from AI model',
        'EMPTY_RESPONSE'
      );
    }
    
    const analysisResult = JSON.parse(text) as AIReminderAnalysis;
    
    // Validate required fields
    if (!analysisResult.category || !analysisResult.title || !analysisResult.reminderDate) {
      throw new GeminiError(
        'AI response missing required fields',
        'INVALID_RESPONSE'
      );
    }
    
    return analysisResult;
    
  } catch (error: any) {
    console.error('[Gemini] Reminder analysis failed:', error);
    
    if (error instanceof GeminiError) {
      throw error;
    }
    
    throw new GeminiError(
      'Failed to analyze image. Please try again.',
      'ANALYSIS_FAILED',
      error
    );
  }
}

// ============================================
// PATTERN ANALYSIS
// ============================================

/**
 * System instruction for pattern detection
 */
function getPatternSystemInstruction(): string {
  return `Analyze this image as a "Hidden-Sight Engine". Detect underlying geometric patterns with mathematical precision.

Look for:
1. **Fibonacci Patterns**: Spirals (φ = 1.618), retracements (23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%), extensions
2. **Sacred Geometry**: Flower of Life, Metatron's Cube, Vesica Piscis, Seed of Life, Platonic solids, Golden Ratio
3. **Channel Patterns**: Parallel trend lines, support/resistance channels
4. **Pitchfork Patterns**: Andrew's pitchfork, Schiff pitchfork
5. **Wave Patterns**: Elliott waves, sinusoidal curves, flowing structures
6. **Geometric Patterns**: Triangles, polygons, grids, axes
7. **Symmetry**: Radial, bilateral, rotational, translational

Identify the TOP 1-3 most prominent patterns.

For each pattern provide:
- **type**: Pattern category
- **subtype**: Specific variant (e.g., "spiral", "flower_of_life")
- **name**: Descriptive name (e.g., "Golden Spiral in Shell", "Fibonacci Retracement Levels")
- **confidence**: 0-1 score based on clarity and mathematical accuracy
- **anchors**: Key points as percentages (0-100) of image dimensions [{x: 25, y: 30}, {x: 75, y: 80}]
- **measurements**: Mathematical properties (goldenRatio, angles, fibonacciRatios, symmetryAxes, etc.)

Also provide:
- **explanation**: 2-3 sentence description of patterns found
- **secretMessage**: Hidden insight or meaning (creative interpretation)
- **shareCaption**: Social media-ready caption (engaging, mysterious)

Return ONLY valid JSON.`;
}

/**
 * Response schema for pattern analysis (FIXED TYPE ANNOTATIONS)
 */
const patternResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    patterns: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: {
            type: SchemaType.STRING,
            enum: Object.values(PatternType),
          },
          subtype: { type: SchemaType.STRING },
          name: { type: SchemaType.STRING },
          confidence: { type: SchemaType.NUMBER },
          anchors: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                x: { type: SchemaType.NUMBER },
                y: { type: SchemaType.NUMBER },
              },
              required: ['x', 'y'],
            },
          },
          measurements: {
            type: SchemaType.OBJECT,
            properties: {
              goldenRatio: { type: SchemaType.NUMBER },
              angles: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.NUMBER },
              },
              fibonacciRatios: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.NUMBER },
              },
              symmetryAxes: { type: SchemaType.NUMBER },
              nodeCount: { type: SchemaType.NUMBER },
              aspectRatio: { type: SchemaType.NUMBER },
            },
          },
        },
        required: ['type', 'name', 'confidence', 'anchors', 'measurements'],
      },
    },
    insights: {
      type: SchemaType.OBJECT,
      properties: {
        explanation: { type: SchemaType.STRING },
        secretMessage: { type: SchemaType.STRING },
        shareCaption: { type: SchemaType.STRING },
      },
      required: ['explanation', 'secretMessage', 'shareCaption'],
    },
  },
  required: ['patterns', 'insights'],
} as const;

/**
 * Analyze image for pattern detection
 */
export async function analyzePatternImage(base64Image: string): Promise<AIPatternAnalysis> {
  try {
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({
      model: API_CONFIG.gemini.patternModel,
    });
    
    const cleanImage = prepareImageData(base64Image);
    
    const result = await retryOperation(async () => {
      return await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: 'Analyze this image for hidden geometric patterns.' },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanImage,
              },
            },
          ],
        }],
        systemInstruction: getPatternSystemInstruction(),
        generationConfig: {
          temperature: AI_CONFIG.pattern.temperature,
          maxOutputTokens: AI_CONFIG.pattern.maxTokens,
          responseMimeType: 'application/json',
          responseSchema: patternResponseSchema as any, // Type assertion to fix strict type check
        },
      });
    });
    
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new GeminiError(
        'No response received from AI model',
        'EMPTY_RESPONSE'
      );
    }
    
    const analysisResult = JSON.parse(text);
    
    // Validate response structure
    if (!analysisResult.patterns || !Array.isArray(analysisResult.patterns)) {
      throw new GeminiError(
        'AI response has invalid structure',
        'INVALID_RESPONSE'
      );
    }
    
    // Add metadata
    const fullResult: AIPatternAnalysis = {
      ...analysisResult,
      metadata: {
        processingTime: 0,
        modelVersion: API_CONFIG.gemini.patternModel,
        edgeDetectionApplied: false,
      },
    };
    
    return fullResult;
    
  } catch (error: any) {
    console.error('[Gemini] Pattern analysis failed:', error);
    
    if (error instanceof GeminiError) {
      throw error;
    }
    
    throw new GeminiError(
      'Failed to analyze image for patterns. Please try again.',
      'ANALYSIS_FAILED',
      error
    );
  }
}

/**
 * Test API key validity
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Test' }] }],
    });
    
    return !!result.response.text();
  } catch (error) {
    console.error('[Gemini] Connection test failed:', error);
    return false;
  }
}
