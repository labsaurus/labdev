import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAjcWB7HqRXEj3Y6Prjjkig854TYOmwo3U");

export async function generateDescription(
  appName: string, 
  appDetails: string
): Promise<{ short: string; long: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Create app store descriptions for "${appName}".
    Details: ${appDetails}
    
    Format:
    SHORT:
    [write a short description under 80 characters]

    LONG:
    [write 4-5 paragraphs about features and benefits]`;

    const result = await model.generateContent(prompt);
    
    if (!result.response) {
      throw new Error('No response from API');
    }

    const text = result.response.text();
    const [shortPart, longPart] = text.split('LONG:');
    const short = shortPart.replace('SHORT:', '').trim();
    const long = longPart.trim();
    
    return { short, long };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}