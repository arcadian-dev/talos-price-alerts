export interface GrokPriceExtraction {
  price: number;
  amount: number;
  unit: string;
  confidence: number;
  rawText?: string;
}

export interface GrokResponse {
  success: boolean;
  data?: GrokPriceExtraction;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class GrokClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.x.ai/v1'; // Grok API endpoint
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GROK_API_KEY || '';
    this.model = model || process.env.GROK_MODEL || 'grok-2-1212'; // Default to latest model
    
    if (!this.apiKey) {
      console.warn('Grok API key not provided. Price extraction will use fallback methods.');
    }
    
    console.log(`Grok API initialized with model: ${this.model}`);
  }

  async extractPriceData(
    htmlContent: string, 
    productName: string,
    vendorName?: string
  ): Promise<GrokResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Grok API key not configured',
      };
    }

    try {
      const prompt = this.buildExtractionPrompt(htmlContent, productName, vendorName);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a precise data extraction assistant. Extract pricing information from webpage content and return only valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1, // Low temperature for consistent extraction
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check for specific error types
        let errorMessage = `Grok API error: ${response.status}`;
        
        if (response.status === 402 || errorText.includes('insufficient') || errorText.includes('credits')) {
          errorMessage = 'Grok API: Insufficient credits. Please add funding to your Grok API account.';
        } else if (response.status === 401) {
          errorMessage = 'Grok API: Invalid API key. Please check your GROK_API_KEY configuration.';
        } else if (response.status === 429) {
          errorMessage = 'Grok API: Rate limit exceeded. Please try again later.';
        } else {
          errorMessage += ` - ${errorText}`;
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      const result = await response.json();
      
      if (!result.choices || result.choices.length === 0) {
        return {
          success: false,
          error: 'No response from Grok API',
        };
      }

      const content = result.choices[0].message.content;
      const extractedData = this.parseGrokResponse(content);

      if (!extractedData) {
        return {
          success: false,
          error: 'Failed to parse Grok response',
        };
      }

      return {
        success: true,
        data: extractedData,
        usage: result.usage,
      };

    } catch (error) {
      console.error('Grok API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Grok API error',
      };
    }
  }

  private buildExtractionPrompt(htmlContent: string, productName: string, vendorName?: string): string {
    // Truncate content to avoid token limits
    const maxContentLength = 3000;
    const truncatedContent = htmlContent.length > maxContentLength 
      ? htmlContent.substring(0, maxContentLength) + '...'
      : htmlContent;

    return `
Extract pricing information for "${productName}"${vendorName ? ` from ${vendorName}` : ''} from this webpage content.

Find:
1. Price (numeric value in USD, remove $ symbols)
2. Amount/quantity (numeric value only)
3. Unit (mg, ml, g, capsules, tablets, iu, mcg)

Content:
${truncatedContent}

Return ONLY a JSON object in this exact format:
{
  "price": number,
  "amount": number,
  "unit": "string",
  "confidence": number_between_0_and_1
}

Rules:
- If multiple prices exist, choose the main/current price
- Confidence should be 0.9+ for clear data, 0.7+ for probable data, 0.5+ for uncertain data
- If no clear pricing found, return: {"price": 0, "amount": 0, "unit": "", "confidence": 0}
- Units must be one of: mg, ml, g, capsules, tablets, iu, mcg
- Do not include any text outside the JSON object
`;
  }

  private parseGrokResponse(content: string): GrokPriceExtraction | null {
    try {
      // Clean the response - remove any markdown formatting or extra text
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      cleanContent = cleanContent.replace(/```json\n?/, '').replace(/```\n?$/, '');
      
      // Find JSON object in the response
      const jsonMatch = cleanContent.match(/\{[^}]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in Grok response:', content);
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the response structure
      if (typeof parsed.price !== 'number' || 
          typeof parsed.amount !== 'number' || 
          typeof parsed.unit !== 'string' || 
          typeof parsed.confidence !== 'number') {
        console.error('Invalid Grok response structure:', parsed);
        return null;
      }

      // Validate confidence is between 0 and 1
      if (parsed.confidence < 0 || parsed.confidence > 1) {
        parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
      }

      // Validate unit is acceptable
      const validUnits = ['mg', 'ml', 'g', 'capsules', 'tablets', 'iu', 'mcg'];
      if (!validUnits.includes(parsed.unit.toLowerCase())) {
        console.warn(`Invalid unit from Grok: ${parsed.unit}`);
        parsed.confidence *= 0.5; // Reduce confidence for invalid unit
      }

      return {
        price: parsed.price,
        amount: parsed.amount,
        unit: parsed.unit.toLowerCase(),
        confidence: parsed.confidence,
        rawText: content,
      };

    } catch (error) {
      console.error('Error parsing Grok response:', error, 'Content:', content);
      return null;
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key not configured',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          error: `API test failed: ${response.status} - ${errorText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  getUsageStats(): { totalRequests: number; totalTokens: number } {
    // In a real implementation, you might want to track usage statistics
    // This could be stored in a database or cache
    return {
      totalRequests: 0,
      totalTokens: 0,
    };
  }
}
