import { Recommendation } from '../types/database';

const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY;

export interface BookAnalysis {
  title: string;
  author: string;
  genre: string;
  reading_level: string;
  maturity_level: string;
  is_movie: boolean;
  future_recommendations: Recommendation[];
  analysis_summary: string;
}

export const analyzeBookCover = async (
  base64Image: string, 
  userGenre: string, 
  userGrade: string
): Promise<BookAnalysis> => {
  // In a real app, you would ideally use a Supabase Edge Function to hide the API key.
  // For this demo, we'll implement the fetch logic here.
  // We'll use Gemini-1.5-flash as it's great for image processing.

  const prompt = `
    Analyze this book cover image. Provide the following details in JSON format:
    - title: The title of the book.
    - author: The author of the book.
    - genre: The main genre.
    - reading_level: Suggested reading level in AR (Accelerated Reader) format if applicable PLUS ALWAYS the grade level (e.g. "4.5 (4th Grade)").
    - maturity_level: Maturity rating (e.g. G, PG, PG-13, R) and brief reason.
    - is_movie: Boolean, true if it has been adapted into a movie.
    - future_recommendations: A list of 3 similar books with "title", "author", and "reason" for each.
    - analysis_summary: A 2-sentence summary. 
      First sentence: Evaluate if this book is appropriate for a student in grade ${userGrade}.
      Second sentence: Mention how well it fits their favorite genre (${userGenre}).
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${AI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
          },
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      throw new Error(`AI Error: ${data.error.message || 'Unknown error'}`);
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates returned from Gemini:', data);
      throw new Error('AI failed to generate a response. The image might be unclear or violate safety guidelines.');
    }

    const resultText = data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      console.error('Empty result text from Gemini:', data);
      throw new Error('AI returned an empty response.');
    }

    try {
      return JSON.parse(resultText) as BookAnalysis;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', resultText);
      // Fallback: Try to find JSON block in markdown if AI wrapped it
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as BookAnalysis;
      }
      throw new Error('AI response was not in the correct format.');
    }
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    throw new Error(error.message || 'Failed to analyze book cover. Please try again.');
  }
};

export interface ShelfAnalysis {
  recommendations: Recommendation[];
  analysis_summary: string;
}

export const analyzeBookshelf = async (
  base64Image: string, 
  userGenre: string, 
  userGrade: string
): Promise<ShelfAnalysis> => {
  const prompt = `
    Analyze this image of a bookshelf. You are a librarian finding the best books for a student.
    The student is in grade/level: ${userGrade}.
    The student's favorite genre is: ${userGenre}.
    
    Look at the books visible on the shelf. Pick the top 3 to 5 books on this shelf that best match the student's favorite genre and are appropriate for their grade level.
    
    Provide the response in JSON format with the following structure:
    - recommendations: A list of the chosen books. Each item should have "title", "author" (if visible/known), and a "reason" explaining why it's a great match for a ${userGenre} fan.
    - analysis_summary: A 2-sentence summary.
      First sentence: Briefly describe the overall collection of books detected on the shelf.
      Second sentence: Mention how many strong matches for their favorite genre were found on the shelf.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
             {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
          },
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) throw new Error(`AI Error: ${data.error.message || 'Unknown error'}`);
    if (!data.candidates || data.candidates.length === 0) throw new Error('AI failed to generate a response.');

    const resultText = data.candidates[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error('AI returned an empty response.');

    try {
      return JSON.parse(resultText) as ShelfAnalysis;
    } catch (parseError) {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ShelfAnalysis;
      }
      throw new Error('AI response was not in the correct format.');
    }
  } catch (error: any) {
    console.error('Bookshelf Analysis Error:', error);
    throw new Error(error.message || 'Failed to analyze bookshelf. Please try again.');
  }
};
