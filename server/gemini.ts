import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API with API key from environment variables
const API_KEY = process.env.GEMINI_FLASH_API_KEY || '';

// Check if API key is provided
if (!API_KEY) {
  console.warn('Missing GEMINI_FLASH_API_KEY environment variable - will use mock data for quizzes');
}

// Create a placeholder model for when the API key is missing
let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(API_KEY);
} catch (error) {
  console.error('Error initializing Gemini AI client:', error);
  // Will use fallback data generation when API is called
}

// Safety settings for content generation
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Interface for quiz parameters
export interface QuizParams {
  topic: string;
  quizType: 'multiple-choice' | 'true-false' | 'short-answer' | 'auto';
  numQuestions?: number;
}

// Interface for question structure
export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

// Generate a quiz based on topic and type
export async function generateQuiz(params: QuizParams): Promise<Question[]> {
  console.log('generateQuiz called with params:', params);
  console.log('API_KEY exists:', !!API_KEY);
  
  // Check if API key is available, provide mock data if not
  if (!API_KEY) {
    console.warn('Using fallback quiz data since Gemini API key is missing');
    const sampleQuiz = getSampleQuiz(params.topic, params.quizType as 'multiple-choice' | 'true-false' | 'short-answer');
    console.log(`Returning sample quiz with ${sampleQuiz.length} questions`);
    return sampleQuiz;
  }
  
  try {
    // Check if we have a valid genAI instance
    if (!genAI) {
      console.warn('Gemini AI client not available - using sample data');
      const sampleQuiz = getSampleQuiz(params.topic, params.quizType as 'multiple-choice' | 'true-false' | 'short-answer');
      console.log(`Returning sample quiz due to missing genAI with ${sampleQuiz.length} questions`);
      return sampleQuiz;
    }
    
    console.log('Initializing Gemini model: gemini-1.5-flash');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Determine the appropriate quiz type if 'auto' is selected
    let quizType = params.quizType;
    
    if (quizType === 'auto') {
      console.log('Auto quiz type selected, determining best type for topic');
      quizType = await determineQuizType(params.topic);
      console.log('Quiz type determined:', quizType);
    }
    
    // Build the prompt based on the quiz type
    const numQuestions = params.numQuestions || 10;
    console.log(`Building prompt for ${quizType} quiz with ${numQuestions} questions`);
    const prompt = buildQuizPrompt(params.topic, quizType as 'multiple-choice' | 'true-false' | 'short-answer', numQuestions);
    
    // Generate content with the model
    console.log('Sending request to Gemini API');
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });
    
    console.log('Received response from Gemini API');
    const response = result.response;
    const text = response.text();
    console.log('Response text length:', text.length);
    
    // Parse the response to extract questions
    console.log('Parsing response to extract questions');
    const questions = parseQuizResponse(text, quizType as 'multiple-choice' | 'true-false' | 'short-answer');
    console.log(`Successfully parsed ${questions.length} questions`);
    return questions;
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    console.warn('Falling back to sample quiz data');
    // Provide sample data on error
    const sampleQuiz = getSampleQuiz(params.topic, params.quizType as 'multiple-choice' | 'true-false' | 'short-answer');
    console.log(`Returning sample quiz due to error with ${sampleQuiz.length} questions`);
    return sampleQuiz;
  }
}

// Get sample quiz data for when the API is unavailable
function getSampleQuiz(topic: string, quizType: 'multiple-choice' | 'true-false' | 'short-answer'): Question[] {
  const defaultQuestions: Question[] = [];
  
  // Format topic for display
  const formattedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  
  // Create sample questions based on quiz type
  if (quizType === 'multiple-choice') {
    for (let i = 1; i <= 5; i++) {
      defaultQuestions.push({
        id: `sample-${i}`,
        question: `Sample question ${i} about ${formattedTopic}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: `This is a sample explanation for question ${i}.`
      });
    }
  } else if (quizType === 'true-false') {
    for (let i = 1; i <= 5; i++) {
      defaultQuestions.push({
        id: `sample-${i}`,
        question: `Sample true/false statement ${i} about ${formattedTopic}.`,
        correctAnswer: i % 2 === 0 ? 'True' : 'False',
        explanation: `This is a sample explanation for statement ${i}.`
      });
    }
  } else if (quizType === 'short-answer') {
    for (let i = 1; i <= 5; i++) {
      defaultQuestions.push({
        id: `sample-${i}`,
        question: `Sample short answer question ${i} about ${formattedTopic}?`,
        correctAnswer: `Sample answer ${i}`,
        explanation: `This is a sample explanation for question ${i}.`
      });
    }
  }
  
  return defaultQuestions;
}

// Determine the best quiz type for a given topic
async function determineQuizType(topic: string): Promise<'multiple-choice' | 'true-false' | 'short-answer'> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are a quiz generation assistant. Based on the topic "${topic}", 
      determine the most appropriate quiz type from these options:
      1. multiple-choice: Best for topics with distinct, concrete answers that can be presented as options.
      2. true-false: Best for facts, statements, or common misconceptions that can be evaluated as true or false.
      3. short-answer: Best for definitions, explanations, or topics requiring brief written responses.
      
      Analyze the topic and respond with ONLY ONE of these words: "multiple-choice", "true-false", or "short-answer".
      Do not include any other text in your response.
    `;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 10,
      },
    });
    
    const response = result.response.text().trim().toLowerCase();
    
    if (response.includes('multiple-choice')) {
      return 'multiple-choice';
    } else if (response.includes('true-false')) {
      return 'true-false';
    } else if (response.includes('short-answer')) {
      return 'short-answer';
    }
    
    // Default to multiple-choice if response is unclear
    return 'multiple-choice';
  } catch (error) {
    console.error('Error determining quiz type:', error);
    return 'multiple-choice'; // Default to multiple-choice on error
  }
}

// Build a quiz generation prompt based on the selected quiz type
function buildQuizPrompt(topic: string, quizType: 'multiple-choice' | 'true-false' | 'short-answer', numQuestions: number): string {
  const basePrompt = `
    You are a quiz generation assistant. Create a ${quizType} quiz about "${topic}" with exactly ${numQuestions} questions.
    
    Follow these specific format requirements:
    1. Return ONLY a valid JSON array of questions.
    2. Each question object must have these fields:
       - "id": a unique string identifier (use UUIDs)
       - "question": the question text
       - "correctAnswer": the correct answer
       - "explanation": a brief explanation of why the answer is correct
  `;
  
  let specificInstructions = '';
  
  switch (quizType) {
    case 'multiple-choice':
      specificInstructions = `
        3. Each question must also include an "options" field with an array of 4 choices.
        4. The "correctAnswer" must be one of the options.
        5. Options should be clear, concise, and distinct from each other.
        6. Include plausible distractors that test understanding, not just memory.
      `;
      break;
    case 'true-false':
      specificInstructions = `
        3. Each question must be a clear statement that can be evaluated as true or false.
        4. The "correctAnswer" must be either "True" or "False".
        5. Include a mix of true and false statements.
        6. Statements should be unambiguous with a clear correct answer.
      `;
      break;
    case 'short-answer':
      specificInstructions = `
        3. Questions should be concise and have specific, brief answers.
        4. The "correctAnswer" should be a short string or phrase (1-5 words).
        5. Questions should focus on definitions, specific facts, or key concepts.
        6. Avoid questions with multiple possible correct answers.
      `;
      break;
  }
  
  return `${basePrompt}${specificInstructions}
    
    Example of the expected JSON format:
    [
      {
        "id": "unique-id-1",
        "question": "Question text goes here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option B",
        "explanation": "Brief explanation of the correct answer."
      }
    ]
    
    Return the JSON array with ${numQuestions} questions about ${topic}.
  `;
}

// Parse the quiz response from Gemini into structured questions
function parseQuizResponse(text: string, quizType: 'multiple-choice' | 'true-false' | 'short-answer'): Question[] {
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }
    
    const jsonText = jsonMatch[0];
    const questions = JSON.parse(jsonText) as Question[];
    
    // Validate and clean up questions
    return questions.map(q => {
      const question: Question = {
        id: q.id || `q-${Math.random().toString(36).substring(2, 11)}`,
        question: q.question,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      };
      
      if (quizType === 'multiple-choice' && Array.isArray(q.options)) {
        question.options = q.options;
      }
      
      return question;
    });
  } catch (error) {
    console.error('Error parsing quiz response:', error);
    throw new Error('Failed to parse quiz response. Please try again.');
  }
}

// Check if a short answer is correct
export async function checkShortAnswer(
  userAnswer: string, 
  correctAnswer: string, 
  questionContext: string
): Promise<{ isCorrect: boolean; explanation: string }> {
  // Check if API key is available, use basic matching if not
  if (!API_KEY || !genAI) {
    console.warn('Using basic string comparison for answer checking (Gemini API key missing)');
    return basicAnswerCheck(userAnswer, correctAnswer);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are a quiz grading assistant. Evaluate whether the user's answer is correct for the given question.
      
      Question: ${questionContext}
      Correct answer: ${correctAnswer}
      User's answer: ${userAnswer}
      
      First, determine if the user's answer is semantically correct, even if the wording is different.
      Then, respond with ONLY a valid JSON object with two fields:
      {
        "isCorrect": true or false,
        "explanation": "Brief explanation of why the answer is correct or incorrect"
      }
    `;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 256,
      },
    });
    
    const response = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }
    
    const jsonText = jsonMatch[0];
    const evaluation = JSON.parse(jsonText) as { isCorrect: boolean; explanation: string };
    
    return evaluation;
  } catch (error) {
    console.error('Error checking short answer:', error);
    // Fall back to basic string comparison
    return basicAnswerCheck(userAnswer, correctAnswer);
  }
}

// Basic answer checking without AI
function basicAnswerCheck(userAnswer: string, correctAnswer: string): { isCorrect: boolean; explanation: string } {
  // Clean and normalize strings for comparison
  const normalizedUserAnswer = userAnswer
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
  
  const normalizedCorrectAnswer = correctAnswer
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
  
  // Check for exact match
  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    return {
      isCorrect: true,
      explanation: 'Your answer matches the correct answer exactly.'
    };
  }
  
  // Check if correct answer is contained in user answer
  if (normalizedUserAnswer.includes(normalizedCorrectAnswer)) {
    return {
      isCorrect: true,
      explanation: 'Your answer contains the correct answer.'
    };
  }
  
  // Check if user answer is contained in correct answer
  if (normalizedCorrectAnswer.includes(normalizedUserAnswer)) {
    return {
      isCorrect: true,
      explanation: 'Your answer is partially correct.'
    };
  }
  
  // Calculate similarity (simple word overlap)
  const userWords = normalizedUserAnswer.split(' ');
  const correctWords = normalizedCorrectAnswer.split(' ');
  
  const commonWords = userWords.filter(word => correctWords.includes(word));
  const similarity = commonWords.length / correctWords.length;
  
  if (similarity >= 0.6) {
    return {
      isCorrect: true,
      explanation: 'Your answer is similar enough to the correct answer.'
    };
  }
  
  return {
    isCorrect: false,
    explanation: `The correct answer is: ${correctAnswer}`
  };
}
