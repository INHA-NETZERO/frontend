import { assistantData } from '../data/mockData';

export const generateAssistantResponse = async (userMessage) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        role: 'assistant',
        content: '이 기능은 추후 구현됩니다. 현재는 데모 버전입니다.',
      });
    }, 500);
  });
};

export const getSuggestedQuestions = () => assistantData.suggestedQuestions;
export const getSystemMessage = () => assistantData.systemMessage;
export const getSampleResponse = (type) => assistantData.sampleResponses[type];