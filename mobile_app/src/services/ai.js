import { OPENAI_API_KEY } from '../config/constants';
import { SUMMARY_PROMPTS } from '../config/prompts';

export const generateSummary = async (transcriptions) => {
  try {
    // Group conversations by date
    const conversationsByDate = transcriptions.reduce((acc, t) => {
      const date = new Date(t.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(t);
      return acc;
    }, {});

    // Prepare the conversation data with date grouping
    const conversationText = Object.entries(conversationsByDate)
      .map(([date, convos]) => {
        const conversationsForDate = convos
          .map(t => t.utterances
            .map(u => `${u.speaker}: ${u.text}`)
            .join('\n')
          )
          .join('\n\n');
        return `[${date}]\n${conversationsForDate}`;
      })
      .join('\n\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: SUMMARY_PROMPTS.system
          },
          {
            role: "user",
            content: SUMMARY_PROMPTS.generateUserPrompt(conversationText)
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate summary');
    }

    // Add some spacing and formatting to the response
    const rawSummary = data.choices[0].message.content.trim();
    
    // Format the summary with proper spacing and structure
    const formattedSummary = rawSummary
      .replace(/\r\n|\r|\n/g, '\n')
      .split('\n')
      .map(line => {
        if (SUMMARY_PROMPTS.patterns.sectionHeaders.test(line)) {
          return `\n${line}\n`;
        }
        if (SUMMARY_PROMPTS.patterns.bulletPoints.test(line)) {
          return `  ${line}`;
        }
        if (SUMMARY_PROMPTS.patterns.headers.test(line)) {
          return `\n${line}\n`;
        }
        return line;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return formattedSummary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}; 