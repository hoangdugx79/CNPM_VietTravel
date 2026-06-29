const config = require('../config');
const { Tour, Destination } = require('../models');

async function chat(message, history) {
  if (!config.gemini.apiKey) {
    return {
      reply: 'Xin lỗi, hiện tại tính năng AI đang được bảo trì (Thiếu GEMINI_API_KEY). Quý khách vui lòng liên hệ hotline 1900 1234.',
    };
  }

  const [tours, dests] = await Promise.all([
    Tour.find({ status: 'active' }).select('title basePrice durationDays durationNights departurePlaceName shortDescription').lean(),
    Destination.find({ status: 'active' }).select('name province').lean(),
  ]);

  const toursData = tours.map((t) => `- ${t.title}: ${t.durationDays}N${t.durationNights}Đ, Giá từ ${t.basePrice}đ. ${t.shortDescription || ''}`).join('\n');
  const destsData = dests.map((d) => `${d.name} (${d.province})`).join(', ');

  const systemPrompt = `Bạn là trợ lý du lịch AI của VietTravel. CHỈ trả lời về tour/điểm đến của công ty.\n\nTOURS:\n${toursData}\n\nĐIỂM ĐẾN:\n${destsData}`;

  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  const contents = [];
  if (history?.length) {
    for (const h of history) contents.push({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  let response;
  try {
    response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents, config: { systemInstruction: systemPrompt, temperature: 0.7 } });
  } catch {
    response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents, config: { systemInstruction: systemPrompt, temperature: 0.7 } });
  }
  return { reply: response.text || 'Xin lỗi, tôi không thể trả lời lúc này.' };
}

module.exports = { chat };
