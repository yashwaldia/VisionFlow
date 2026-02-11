/**
 * VisionFlow AI - Gemini Service (v4.1 - Strict Pattern Classification)
 * AI-powered image analysis for reminders and patterns
 * 
 * @module services/gemini
 * @version 4.1.0
 * 
 * CHANGELOG v4.1:
 * - ✅ Strict pattern type normalization (4 categories only)
 * - ✅ Smarter, more explicit AI prompt for classification
 * - ✅ Edge case handling for ambiguous classifications
 * - ✅ Reduced prompt size for token efficiency
 * - ✅ JSON parse error handling with fallback
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AIReminderAnalysis, ReminderCategory } from '../types/reminder.types';
import { 
  AIPatternAnalysis, 
  PatternType, 
  PatternDomain, 
  PatternScale,
  AnalysisQuality 
} from '../types/pattern.types';
import { API_CONFIG, AI_CONFIG } from '../constants/config';
import * as ImageService from './image.service';

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
      'Gemini API key is not configured. Please add EXPO_PUBLIC_VISIONFLOW_GEMINI_API_KEY to your .env file.',
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
// PATTERN TYPE NORMALIZATION (v4.1)
// ============================================

/**
 * Normalize AI-generated pattern type to strict 4-category taxonomy
 * 
 * ALLOWED CATEGORIES:
 * - fibonacci: Golden ratio, spirals, Fibonacci sequences
 * - geometric: All geometric patterns, grids, repetition, shapes
 * - symmetry: Bilateral, radial, mirror, rotational symmetry
 * - custom: Everything else, unknown, or ambiguous patterns
 * 
 * @param aiType - Raw pattern type from AI
 * @param aiSubtype - Pattern subtype for disambiguation
 * @param aiName - Pattern name for additional context
 * @returns Normalized PatternType (one of 4 allowed)
 */
function normalizePatternType(
  aiType: string,
  aiSubtype?: string,
  aiName?: string
): PatternType {
  const typeLC = aiType.toLowerCase().trim();
  const subtypeLC = (aiSubtype || '').toLowerCase().trim();
  const nameLC = (aiName || '').toLowerCase().trim();
  
  // Combine all text for matching
  const combined = `${typeLC} ${subtypeLC} ${nameLC}`;
  
  console.log(`[Gemini] 🔄 Normalizing: "${aiType}" → `, { subtype: aiSubtype, name: aiName });
  
  // ═══ FIBONACCI PATTERNS ═══
  if (
    typeLC.includes('fibonacci') ||
    typeLC.includes('golden') ||
    typeLC.includes('spiral') ||
    typeLC === 'elliott_wave' ||
    combined.includes('golden ratio') ||
    combined.includes('φ') ||
    combined.includes('phi') ||
    combined.includes('1.618') ||
    combined.includes('logarithmic spiral') ||
    combined.includes('fibonacci sequence')
  ) {
    console.log(`[Gemini] ✅ Normalized to: FIBONACCI`);
    return PatternType.FIBONACCI;
  }
  
  // ═══ SYMMETRY PATTERNS ═══
  if (
    typeLC.includes('symmetry') ||
    typeLC.includes('symmetric') ||
    typeLC.includes('bilateral') ||
    typeLC.includes('radial') ||
    typeLC.includes('mirror') ||
    typeLC.includes('reflection') ||
    typeLC.includes('rotational') ||
    combined.includes('axis') ||
    combined.includes('balanced') ||
    subtypeLC.includes('bilateral') ||
    subtypeLC.includes('radial') ||
    subtypeLC.includes('mirror') ||
    nameLC.includes('symmetry')
  ) {
    console.log(`[Gemini] ✅ Normalized to: SYMMETRY`);
    return PatternType.SYMMETRY;
  }
  
  // ═══ GEOMETRIC PATTERNS ═══
  // THIS is where "geometric_repetition", "repetition", "grid", etc. should map
  if (
    typeLC.includes('geometric') ||
    typeLC.includes('repetition') ||
    typeLC.includes('repeating') ||
    typeLC.includes('pattern') ||
    typeLC.includes('grid') ||
    typeLC.includes('tile') ||
    typeLC.includes('tessellation') ||
    typeLC.includes('fractal') ||
    typeLC.includes('shape') ||
    typeLC.includes('polygon') ||
    typeLC.includes('triangle') ||
    typeLC.includes('square') ||
    typeLC.includes('circle') ||
    typeLC.includes('rectangle') ||
    typeLC.includes('hexagon') ||
    combined.includes('repeating') ||
    combined.includes('recurring') ||
    combined.includes('periodic') ||
    combined.includes('tessellat') ||
    combined.includes('structured') ||
    // CRITICAL FIX: Explicitly catch compound types
    (typeLC.includes('geometric') && combined.includes('repetition')) ||
    // Stock market patterns (geometric in nature)
    typeLC.includes('head_shoulders') ||
    typeLC.includes('triangle') ||
    typeLC.includes('wedge') ||
    typeLC.includes('flag') ||
    typeLC.includes('pennant') ||
    typeLC.includes('channel') ||
    typeLC.includes('pitchfork')
  ) {
    console.log(`[Gemini] ✅ Normalized to: GEOMETRIC`);
    return PatternType.GEOMETRIC;
  }
  
  // ═══ CUSTOM (FALLBACK) ═══
  // Anything not clearly matching above categories
  console.log(`[Gemini] ⚠️ No clear match → Defaulting to: CUSTOM`);
  return PatternType.CUSTOM;
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
 * Response schema for reminder analysis
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
          responseSchema: reminderResponseSchema as any,
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
// PATTERN ANALYSIS - SMART PROMPT v4.1
// ============================================

/**
 * SMART Pattern Detection System Instruction (v4.1)
 * 
 * Key improvements:
 * - Explicit 4-category constraint with examples
 * - Clear mapping guidelines for edge cases
 * - Reduced verbosity for token efficiency
 * - Specific instructions for "geometric_repetition" → "geometric"
 */
function getPatternSystemInstruction(): string {
  return `You are a pattern detection AI for "VisionFlow". Analyze images for geometric patterns.

CRITICAL: You MUST classify every pattern as EXACTLY one of these 4 types:

1. "fibonacci" - Use for:
   - Golden ratio (φ = 1.618) relationships
   - Fibonacci spirals, logarithmic spirals
   - Fibonacci sequences in nature
   - Elliott waves (financial charts)
   - Golden angle, phyllotaxis patterns

2. "geometric" - Use for:
   - ANY repeating patterns, grids, tiles
   - Geometric shapes: triangles, squares, circles, polygons
   - Tessellations, fractals (self-repeating)
   - Stock chart patterns: head & shoulders, triangles, channels
   - Structured layouts, architectural patterns
   - IMPORTANT: "geometric repetition" = "geometric" (NOT a separate type)

3. "symmetry" - Use for:
   - Bilateral symmetry (left-right mirror)
   - Radial symmetry (rotational around center)
   - Mirror reflections, rotational balance
   - Symmetry axes in any direction

4. "custom" - Use ONLY for:
   - Completely unidentifiable patterns
   - Very low confidence detections (<0.3)
   - Ambiguous or mixed patterns that don't clearly fit above 3

CLASSIFICATION RULES:
- If a pattern has BOTH geometric AND repetition elements → use "geometric"
- If a pattern has symmetry AND geometric elements → choose the DOMINANT feature
- Spirals with golden ratio → "fibonacci", otherwise → "geometric"
- Never invent new type names or combine types (e.g., NO "geometric_repetition", "symmetric_grid")
- When uncertain between types, prefer: fibonacci > geometric > symmetry > custom

WORKFLOW:
1. Detect content area (exclude borders, watermarks, UI)
2. Identify 1-3 most prominent patterns
3. Classify each using ONLY the 4 types above
4. Provide anchor points (0-100 scale relative to content area)
5. Generate 3-5 overlay steps (descriptive, not code)

MEASUREMENTS:
- Include relevant metrics (goldenRatio, symmetryAxes, angles, etc.)
- Can be empty {} if no measurements apply

OUTPUT:
- Use realistic confidence scores (0.3-0.95 range)
- Provide clear, concise pattern names
- Return ONLY valid JSON (no markdown, no explanations)`;
}

/**
 * Simplified response schema (v4.1)
 */
const patternResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    contentArea: {
      type: SchemaType.OBJECT,
      properties: {
        topLeftX: { type: SchemaType.NUMBER },
        topLeftY: { type: SchemaType.NUMBER },
        bottomRightX: { type: SchemaType.NUMBER },
        bottomRightY: { type: SchemaType.NUMBER },
        confidence: { type: SchemaType.NUMBER },
        detectedArtifacts: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ['topLeftX', 'topLeftY', 'bottomRightX', 'bottomRightY', 'confidence', 'detectedArtifacts'],
    },
    patterns: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: {
            type: SchemaType.STRING,
            description: 'MUST be exactly: fibonacci, geometric, symmetry, or custom',
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
              angles: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER } },
              symmetryAxes: { type: SchemaType.NUMBER },
            },
          },
          overlaySteps: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          domain: {
            type: SchemaType.STRING,
            enum: ['finance', 'nature', 'art', 'geometry', 'architecture', 'other'],
          },
          scale: {
            type: SchemaType.STRING,
            enum: ['micro', 'meso', 'macro', 'multi-scale'],
          },
          orientation: { type: SchemaType.NUMBER },
        },
        required: ['type', 'name', 'confidence', 'anchors', 'measurements', 'overlaySteps', 'domain', 'scale', 'orientation'],
      },
    },
    insights: {
      type: SchemaType.OBJECT,
      properties: {
        explanation: { type: SchemaType.STRING },
        secretMessage: { type: SchemaType.STRING },
        shareCaption: { type: SchemaType.STRING },
        primaryDomain: {
          type: SchemaType.STRING,
          enum: ['finance', 'nature', 'art', 'geometry', 'architecture', 'other'],
        },
        patternComplexity: {
          type: SchemaType.STRING,
          enum: ['simple', 'moderate', 'complex', 'highly_complex'],
        },
        suggestedActions: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ['explanation', 'secretMessage', 'shareCaption', 'primaryDomain', 'patternComplexity'],
    },
  },
  required: ['contentArea', 'patterns', 'insights'],
} as const;

/**
 * Generate default overlay steps based on pattern type
 */
function generateDefaultOverlaySteps(patternType: PatternType): string[] {
  const defaults: Record<PatternType, string[]> = {
    [PatternType.FIBONACCI]: [
      'Mark center point and key spiral positions',
      'Draw golden ratio spiral (φ=1.618)',
      'Add golden rectangles overlay',
      'Highlight proportional relationships',
    ],
    [PatternType.GEOMETRIC]: [
      'Identify repeating unit or base shape',
      'Mark pattern grid or structure',
      'Connect repeated geometric elements',
      'Highlight pattern periodicity',
    ],
    [PatternType.SYMMETRY]: [
      'Mark symmetry axis or center point',
      'Plot mirrored anchor points',
      'Connect symmetrical elements',
      'Emphasize balanced structure',
    ],
    [PatternType.CUSTOM]: [
      'Mark key structural points',
      'Connect primary pattern elements',
      'Add detail annotations',
      'Complete pattern visualization',
    ],
  };
  
  return defaults[patternType] || defaults[PatternType.CUSTOM];
}

/**
 * Analyze image for pattern detection with strict normalization (v4.1)
 */
export async function analyzePatternImage(base64Image: string): Promise<AIPatternAnalysis> {
  try {
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({
      model: API_CONFIG.gemini.patternModel,
    });
    
    const cleanImage = prepareImageData(base64Image);
    
    console.log('[Gemini] 🧠 Running pattern analysis...');
    
    const result = await retryOperation(async () => {
      return await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: 'Analyze this image for geometric patterns. Classify each pattern as: fibonacci, geometric, symmetry, or custom. Return structured JSON.' },
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
          temperature: 0.3,
          maxOutputTokens: 3000,
          topK: 20,
          topP: 0.85,
          responseMimeType: 'application/json',
          responseSchema: patternResponseSchema as any,
        },
      });
    });
    
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new GeminiError('No response received', 'EMPTY_RESPONSE');
    }
    
    // ═══════════════════════════════════════════════════════════
    // ROBUST JSON PARSING WITH ERROR HANDLING
    // ═══════════════════════════════════════════════════════════
    
    let analysisResult: any;
    
    try {
      analysisResult = JSON.parse(text);
    } catch (parseError: any) {
      console.error('[Gemini] ❌ JSON parse error:', parseError.message);
      console.error('[Gemini] Response text:', text.substring(0, 500));
      
      if (text.length > 0 && !text.trim().endsWith('}')) {
        throw new GeminiError(
          'AI response was incomplete. Please try again with a simpler image.',
          'TRUNCATED_RESPONSE',
          parseError
        );
      }
      
      throw new GeminiError(
        'Failed to parse AI response. Please try again.',
        'PARSE_ERROR',
        parseError
      );
    }
    
    // ═══════════════════════════════════════════════════════════
    // PHASE 1: CONTENT AREA VALIDATION
    // ═══════════════════════════════════════════════════════════
    
    if (!analysisResult.contentArea) {
      console.warn('[Gemini] ⚠️ Missing contentArea, assuming full image');
      analysisResult.contentArea = {
        topLeftX: 0,
        topLeftY: 0,
        bottomRightX: 100,
        bottomRightY: 100,
        confidence: 0.5,
        detectedArtifacts: [],
      };
    }
    
    const ca = analysisResult.contentArea;
    const isValidBounds = 
      ca.topLeftX >= 0 && ca.topLeftX <= 100 &&
      ca.topLeftY >= 0 && ca.topLeftY <= 100 &&
      ca.bottomRightX >= 0 && ca.bottomRightX <= 100 &&
      ca.bottomRightY >= 0 && ca.bottomRightY <= 100 &&
      ca.topLeftX < ca.bottomRightX &&
      ca.topLeftY < ca.bottomRightY;
    
    if (!isValidBounds) {
      console.error('[Gemini] ❌ Invalid content area, resetting to full image');
      analysisResult.contentArea = {
        topLeftX: 0, topLeftY: 0, bottomRightX: 100, bottomRightY: 100,
        confidence: 0.5, detectedArtifacts: [],
      };
    }
    
    if (!Array.isArray(ca.detectedArtifacts)) {
      ca.detectedArtifacts = [];
    }
    
    // ═══════════════════════════════════════════════════════════
    // PHASE 2: PATTERN TYPE NORMALIZATION (CRITICAL v4.1)
    // ═══════════════════════════════════════════════════════════
    
    if (!analysisResult.patterns || !Array.isArray(analysisResult.patterns)) {
      throw new GeminiError('AI response has invalid structure', 'INVALID_RESPONSE');
    }
    
    console.log(`[Gemini] 📋 Processing ${analysisResult.patterns.length} patterns...`);
    
    for (let i = 0; i < analysisResult.patterns.length; i++) {
      const pattern = analysisResult.patterns[i];
      
      // ────── STRICT TYPE NORMALIZATION ──────
      const originalType = pattern.type;
      pattern.type = normalizePatternType(pattern.type, pattern.subtype, pattern.name);
      
      if (originalType !== pattern.type) {
        console.log(`[Gemini] 🔧 Corrected pattern #${i + 1}: "${originalType}" → "${pattern.type}"`);
      }
      
      // ────── Validate overlaySteps ──────
      if (!pattern.overlaySteps || !Array.isArray(pattern.overlaySteps) || pattern.overlaySteps.length === 0) {
        console.warn(`[Gemini] ⚠️ Pattern "${pattern.name}" missing overlaySteps, generating defaults`);
        pattern.overlaySteps = generateDefaultOverlaySteps(pattern.type);
      }
      
      if (pattern.overlaySteps.length < 3) {
        while (pattern.overlaySteps.length < 3) {
          pattern.overlaySteps.push('Continue pattern development');
        }
      }
      if (pattern.overlaySteps.length > 5) {
        pattern.overlaySteps = pattern.overlaySteps.slice(0, 5);
      }
      
      // ────── Validate anchors ──────
      if (!pattern.anchors || !Array.isArray(pattern.anchors)) {
        console.error(`[Gemini] ❌ Pattern "${pattern.name}" missing anchors, adding defaults`);
        pattern.anchors = [{ x: 50, y: 50 }];
      }
      
      const validAnchors = pattern.anchors.filter((anchor: any) => {
        return (
          typeof anchor.x === 'number' && 
          typeof anchor.y === 'number' &&
          anchor.x >= 0 && anchor.x <= 100 &&
          anchor.y >= 0 && anchor.y <= 100
        );
      });
      
      pattern.anchors = validAnchors.length >= 2 ? validAnchors : [
        { x: 25, y: 25 },
        { x: 75, y: 75 },
      ];
      
      // ────── Validate confidence ──────
      if (typeof pattern.confidence !== 'number' || pattern.confidence < 0 || pattern.confidence > 1) {
        console.warn(`[Gemini] ⚠️ Invalid confidence for "${pattern.name}", setting to 0.5`);
        pattern.confidence = 0.5;
      }
      
      // ────── Validate metadata fields ──────
      if (!pattern.domain || !['finance', 'nature', 'art', 'geometry', 'architecture', 'other'].includes(pattern.domain)) {
        pattern.domain = 'other';
      }
      
      if (!pattern.scale || !['micro', 'meso', 'macro', 'multi-scale'].includes(pattern.scale)) {
        pattern.scale = 'macro';
      }
      
      if (typeof pattern.orientation !== 'number' || pattern.orientation < 0 || pattern.orientation > 360) {
        pattern.orientation = 0;
      }
      
      // ────── Validate measurements ──────
      if (!pattern.measurements || typeof pattern.measurements !== 'object') {
        pattern.measurements = {};
      }
    }
    
    // ═══════════════════════════════════════════════════════════
    // PHASE 3: QUALITY FILTERING
    // ═══════════════════════════════════════════════════════════
    
    const MIN_CONFIDENCE = 0.25;
    const highQualityPatterns = analysisResult.patterns.filter((p: any) => p.confidence >= MIN_CONFIDENCE);
    
    if (highQualityPatterns.length < analysisResult.patterns.length) {
      console.log(`[Gemini] 🔍 Filtered ${analysisResult.patterns.length - highQualityPatterns.length} low-confidence patterns`);
      analysisResult.patterns = highQualityPatterns;
    }
    
    if (analysisResult.patterns.length === 0) {
      console.warn('[Gemini] ⚠️ No patterns detected, adding placeholder');
      analysisResult.patterns = [{
        type: PatternType.CUSTOM,
        subtype: 'unidentified',
        name: 'No Clear Pattern Detected',
        confidence: 0.3,
        anchors: [{ x: 50, y: 50 }],
        measurements: {},
        overlaySteps: ['No clear geometric pattern found in this image'],
        domain: 'other',
        scale: 'macro',
        orientation: 0,
      }];
    }
    
    // ═══════════════════════════════════════════════════════════
    // PHASE 4: INSIGHTS VALIDATION
    // ═══════════════════════════════════════════════════════════
    
    if (!analysisResult.insights) {
      analysisResult.insights = {
        explanation: 'Pattern analysis completed.',
        secretMessage: 'Hidden patterns revealed.',
        shareCaption: 'Discover the patterns within.',
        primaryDomain: 'other',
        patternComplexity: 'simple',
      };
    }
    
    if (!analysisResult.insights.primaryDomain) {
      analysisResult.insights.primaryDomain = analysisResult.patterns[0]?.domain || 'other';
    }
    
    if (!analysisResult.insights.patternComplexity) {
      analysisResult.insights.patternComplexity = 
        analysisResult.patterns.length >= 3 ? 'complex' :
        analysisResult.patterns.length === 2 ? 'moderate' : 'simple';
    }
    
    if (!Array.isArray(analysisResult.insights.suggestedActions)) {
      analysisResult.insights.suggestedActions = [];
    }
    
    // ═══════════════════════════════════════════════════════════
    // PHASE 5: BUILD FINAL RESULT
    // ═══════════════════════════════════════════════════════════
    
    const avgConfidence = analysisResult.patterns.reduce((sum: number, p: any) => sum + p.confidence, 0) / analysisResult.patterns.length;
    const analysisQuality: AnalysisQuality = 
      avgConfidence > 0.7 ? AnalysisQuality.HIGH :
      avgConfidence > 0.5 ? AnalysisQuality.MEDIUM : AnalysisQuality.LOW;
    
    const fullResult: AIPatternAnalysis = {
      contentArea: analysisResult.contentArea,
      patterns: analysisResult.patterns,
      insights: analysisResult.insights,
      metadata: {
        processingTime: 0,
        modelVersion: API_CONFIG.gemini.patternModel,
        edgeDetectionApplied: false,
        analysisQuality,
      },
    };
    
    // ═══════════════════════════════════════════════════════════
    // ENHANCED LOGGING
    // ═══════════════════════════════════════════════════════════
    
    console.log(`[Gemini] ═══════════════════════════════════════`);
    console.log(`[Gemini] ✅ Pattern Analysis Complete`);
    console.log(`[Gemini] 🎯 Patterns Found: ${analysisResult.patterns.length}`);
    
    analysisResult.patterns.forEach((pattern: any, idx: number) => {
      console.log(`[Gemini]   ${idx + 1}. ${pattern.name} (${pattern.type})`);
      console.log(`[Gemini]      └─ Confidence: ${(pattern.confidence * 100).toFixed(1)}%`);
    });
    
    console.log(`[Gemini] ⭐ Quality: ${analysisQuality.toUpperCase()}`);
    console.log(`[Gemini] ═══════════════════════════════════════`);
    
    return fullResult;
    
  } catch (error: any) {
    console.error('[Gemini] ❌ Pattern analysis failed:', error);
    
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
 * Complete pattern analysis workflow
 */
export async function analyzePatternImageComplete(imageUri: string): Promise<{
  analysis: AIPatternAnalysis;
  images: {
    original: string;
    edges: string;
    width: number;
    height: number;
  };
}> {
  try {
    const startTime = Date.now();
    
    console.log('[Gemini] 🖼️ Preparing pattern images...');
    const processedImages = await ImageService.preparePatternImages(imageUri);
    
    const base64 = await ImageService.extractBase64(processedImages.original);
    
    console.log('[Gemini] 🧠 Running pattern detection with strict 4-category classification...');
    const analysis = await analyzePatternImage(base64);
    
    const processingTime = Date.now() - startTime;
    analysis.metadata = {
      ...analysis.metadata,
      processingTime,
      edgeDetectionApplied: true,
    };
    
    console.log(`[Gemini] ✅ Complete analysis finished in ${processingTime}ms`);
    
    return {
      analysis,
      images: processedImages,
    };
    
  } catch (error: any) {
    console.error('[Gemini] ❌ Complete pattern analysis failed:', error);
    
    if (error instanceof GeminiError) {
      throw error;
    }
    
    if (error.name === 'ImageProcessingError') {
      throw new GeminiError(
        'Failed to process image for analysis. Please try a different image.',
        'IMAGE_PROCESSING_FAILED',
        error
      );
    }
    
    throw new GeminiError(
      'Failed to complete pattern analysis. Please try again.',
      'ANALYSIS_WORKFLOW_FAILED',
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Test' }] }],
    });
    
    return !!result.response.text();
  } catch (error) {
    console.error('[Gemini] Connection test failed:', error);
    return false;
  }
}
