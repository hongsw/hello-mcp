import axios from 'axios';
import rc from "rc";

const config = rc("garak"); // ~/.garakrc에서 설정 불러옴

// 로컬 OpenAI 호환 서버 설정
const API_BASE_URL = config.BASE_URL ? `${config.BASE_URL}/api/send` : "https://garak.wwwai.site/api/send";

async function createApiKey(email, purpose) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/keys`, {
      email,
      purpose
    });
    
    return response.data.apiKey;
  } catch (error) {
    if (error.response) {
      throw new Error(`서버 오류: ${error.response.data.error}`);
    } else if (error.request) {
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    } else {
      throw new Error(`요청 중 오류가 발생했습니다: ${error.message}`);
    }
  }
}

// 사용량 확인
async function checkUsage(apiKey) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/usage`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('사용량 확인 중 오류:', error.message);
    return null;
  }
}

export {
  createApiKey,
  checkUsage
};