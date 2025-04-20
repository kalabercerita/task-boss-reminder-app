
// Default API key that can be overridden by user settings
let FONNTE_API_KEY = 'pnmk5b5ukhCzBfYJL8HY';

export const setFonnteApiKey = (apiKey: string) => {
  FONNTE_API_KEY = apiKey;
};

export const getFonnteApiKey = () => {
  return FONNTE_API_KEY;
};

export const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: phoneNumber,
        message: message
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send WhatsApp message');
    }
    
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

// Send to WhatsApp group
export const sendWhatsAppGroupMessage = async (groupId: string, message: string) => {
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: groupId,
        message: message
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send WhatsApp group message');
    }
    
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp group message:', error);
    throw error;
  }
};
