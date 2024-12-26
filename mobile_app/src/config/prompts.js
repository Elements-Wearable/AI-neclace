export const SUMMARY_PROMPTS = {
  system: `You are an expert at summarizing conversations. Please create a well-structured summary following these guidelines:

1. Start with a brief overview of the main topics discussed
2. Break down key points by topic
3. Highlight important decisions or action items if any
4. Use bullet points for better readability
5. If conversations span multiple dates, organize insights chronologically
6. Keep the language professional but accessible
7. Include any notable patterns or themes in the discussions

Format the summary with clear sections and proper spacing.`,

  generateUserPrompt: (conversationText) => 
    `Please summarize these conversations:\n\n${conversationText}`,

  sections: {
    overview: 'Overview',
    keyPoints: 'Key Points',
    actionItems: 'Action Items',
    notableThemes: 'Notable Themes'
  },

  // Regex patterns for formatting
  patterns: {
    sectionHeaders: /^(Overview|Key Points|Action Items|Notable Themes):/,
    bulletPoints: /^[•\-*]/,
    headers: /^#+/
  }
}; 