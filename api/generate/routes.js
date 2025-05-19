import { Configuration, OpenAIApi } from 'openai';

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Generate AI content for social media
 */
async function generateContent(text, platform) {
  try {
    // Generate Caption
    const captionPrompt = `You're a social media expert. Create a viral ${platform} caption for this content: "${text.substring(0, 500)}"`;
    
    const captionResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: captionPrompt }]
    });
    
    // Generate Hashtags
    const hashtagPrompt = `Generate 8 trending hashtags for ${platform} about: "${text.substring(0, 300)}"`;
    
    const hashtagResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: hashtagPrompt }]
    });

    return {
      caption: captionResponse.data.choices[0].message.content.trim(),
      hashtags: hashtagResponse.data.choices[0].message.content
        .trim()
        .split('\n')
        .map(h => h.replace(/^[-*]\s*/, ''))
        .join(' ')
    };
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
}

// API Route Handler
export default async function handler(req, res) {
  try {
    const { text, platform } = await req.json();
    
    // Input validation
    if (!text || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: text and platform' }),
        { status: 400 }
      );
    }

    // Generate content
    const result = await generateContent(text, platform);
    
    // Return response
    return new Response(JSON.stringify(result));
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({ error: 'AI generation failed: ' + error.message }),
      { status: 500 }
    );
  }
}
