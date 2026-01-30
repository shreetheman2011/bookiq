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
