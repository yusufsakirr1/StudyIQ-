interface ProcessNoteParams {
  text: string;
  format: 'Summary' | 'Detailed' | 'Bullet Points';
}

// OpenAI API key - Bu anahtarı kendi OpenAI API anahtarınızla değiştirin
// https://platform.openai.com/api-keys adresinden yeni anahtar alabilirsiniz
const API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Kendi API anahtarınızı buraya yazın
const API_URL = 'https://api.openai.com/v1/chat/completions';

export const processNote = async ({ text, format }: ProcessNoteParams) => {
  console.log('🔍 Processing note started:', { format, textLength: text.length });

  // API anahtarı kontrolü
  if (!API_KEY) {
    throw new Error('OpenAI API anahtarı ayarlanmamış. Lütfen src/services/openaiService.ts dosyasında API anahtarınızı güncelleyin.');
  }

  try {
    console.log('🚀 Using GPT-4o-mini API for text analysis');
    console.log('🔑 API Key present:', API_KEY ? 'Yes' : 'No');
    console.log('🔑 API Key length:', API_KEY.length);

    // Create clean, professional prompts for each format
    let userPrompt = '';

    switch (format) {
      case 'Summary':
        userPrompt = `Please analyze the following text and provide a concise summary in the EXACT SAME LANGUAGE as the input text. If the input is in Turkish, respond in Turkish. If it's in English, respond in English. Focus only on the most important points:\n\n${text}`;
        break;
      case 'Detailed':
        userPrompt = `Please analyze and explain the following text in detail, using the EXACT SAME LANGUAGE as the input text. If the input is in Turkish, respond in Turkish. If it's in English, respond in English. Provide a comprehensive analysis:\n\n${text}`;
        break;
      case 'Bullet Points':
        userPrompt = `Please organize the following text into bullet points in the EXACT SAME LANGUAGE as the input text. If the input is in Turkish, respond in Turkish. If it's in English, respond in English. Create separate bullet points for each important topic:\n\n${text}`;
        break;
    }

    console.log('⏰ Making GPT-4o-mini API request...');

    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.5
    };

    console.log('📤 Request body prepared');

    // XMLHttpRequest has built-in timeout, no need for AbortController

    console.log('📤 Sending request to OpenAI API...');

    try {
      // Use XMLHttpRequest for Android compatibility
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        const timeout = setTimeout(() => {
          xhr.abort();
          reject(new Error('Request timeout'));
        }, 15000);

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            clearTimeout(timeout);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({
                ok: true,
                status: xhr.status,
                json: async () => JSON.parse(xhr.responseText)
              });
            } else {
              resolve({
                ok: false,
                status: xhr.status,
                text: async () => xhr.responseText
              });
            }
          }
        };

        xhr.onerror = function () {
          clearTimeout(timeout);
          reject(new Error('Network error'));
        };

        xhr.open('POST', API_URL, true); // true for async
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${API_KEY}`);
        xhr.setRequestHeader('Accept', 'application/json');

        // Daha detaylı hata yakalama
        xhr.onprogress = function () {
          console.log('Request in progress...');
        };

        xhr.onerror = function (error) {
          console.error('XHR Error:', error);
          clearTimeout(timeout);
          reject(new Error('Ağ hatası: Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'));
        };
        xhr.send(JSON.stringify(requestBody));
      });

      console.log('📡 Response received! Status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API Error:', response.status, errorData);

        switch (response.status) {
          case 401:
            throw new Error('API anahtarı geçersiz veya süresi dolmuş. Lütfen OpenAI hesabınızdan yeni bir API anahtarı alın.');
          case 429:
            throw new Error('Çok fazla istek gönderildi. Lütfen birkaç dakika bekleyip tekrar deneyin.');
          case 500:
          case 502:
          case 503:
            throw new Error('OpenAI servisi şu anda kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.');
          default:
            throw new Error(`API hatası (${response.status}). Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`);
        }
      }

      const data = await response.json();
      console.log('✅ GPT-4o-mini Response parsed successfully');

      const aiContent = data.choices?.[0]?.message?.content;

      if (!aiContent) {
        console.error('❌ No content in response:', data);
        throw new Error('AI\'dan yanıt alınamadı. Lütfen tekrar deneyin.');
      }

      console.log('🤖 GPT-4o-mini response received, length:', aiContent.length);

      // Return the AI response directly as clean format
      let formatTitle = '';
      switch (format) {
        case 'Summary': formatTitle = 'Summary'; break;
        case 'Detailed': formatTitle = 'Detailed Analysis'; break;
        case 'Bullet Points': formatTitle = 'Bullet Points'; break;
        default: formatTitle = 'Analysis'; break;
      }

      return {
        title: formatTitle,
        sections: [{
          title: '',
          items: [{
            term: '',
            definition: aiContent
          }]
        }]
      };

    } catch (fetchError) {
      console.error('📡 XMLHttpRequest error:', fetchError);
      throw fetchError;
    }

  } catch (error) {
    console.error('💥 Error in processNote:', error);

    // Show the actual error to user instead of fallback
    if (error instanceof Error) {
      throw error; // Orijinal hata mesajını koru
    }

    throw new Error('Bilinmeyen bir hata oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
  }
};

