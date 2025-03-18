import chalk from 'chalk';
import { createRequire } from 'module';

// CommonJS 모듈 로드를 위한 require 함수 생성
const require = createRequire(import.meta.url);
const rc = require('rc');
const config = rc("garak"); // ~/.garakrc에서 설정 불러옴

/**
 * CLI 명령어를 실행하는 함수
 * @param {string} command - 실행할 명령어
 * @param {Array} args - 명령어 인자
 */
export async function executeCommand(command, args) {
  switch (command) {
    case 'send-email':
      return sendEmail(args[0], args[1]);
      
    case 'add':
      return add(parseFloat(args[0]), parseFloat(args[1]));
      
    default:
      throw new Error(`알 수 없는 명령어: ${command}`);
  }
}

/**
 * 이메일 전송 명령
 * @param {string} email - 이메일 주소
 * @param {string} body - 이메일 내용
 */
async function sendEmail(email, body) {
  if (!email || !body) {
    throw new Error('이메일 주소와 내용이 필요합니다.');
  }
  
  const token = config.GARAK_API_KEY;
  if (!token) {
    throw new Error('API KEY가 없습니다. `npx hi-garak --refresh-token` 명령어로 API KEY를 생성해주세요.');
  }
  
  // 서버 URL 설정

  const serverUrl = config.BASE_URL ? `${config.BASE_URL}/api/send` : "https://garak.wwwai.site/api/send";
  
  console.log(chalk.cyan(`${email}로 이메일을 전송 중...`));
  
  // API 요청
  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ email, body })
    });
    
    const result = await response.json();
    console.log(chalk.green('이메일을 성공적으로 보냈습니다.'));
    return result;
  } catch (error) {
    throw new Error(`이메일 전송 중 오류가 발생했습니다: ${error.message}`);
  }
}

/**
 * 두 숫자를 더하는 명령
 * @param {number} a - 첫 번째 숫자
 * @param {number} b - 두 번째 숫자
 */
function add(a, b) {
  if (isNaN(a) || isNaN(b)) {
    throw new Error('유효한 숫자가 필요합니다.');
  }
  
  const result = a + b;
  console.log(chalk.green(`${a} + ${b} = ${result}`));
  return result;
} 