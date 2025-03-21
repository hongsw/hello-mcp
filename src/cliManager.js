import chalk from 'chalk';
import { createRequire } from 'module';
import { __ } from './i18n.js'; // i18n 모듈 가져오기

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
      throw new Error(__('unknown_command', { command }));
  }
}

/**
 * 이메일 전송 명령
 * @param {string} email - 이메일 주소
 * @param {string} body - 이메일 내용
 */
async function sendEmail(email, body) {
  if (!email || !body) {
    throw new Error(__('missing_email'));
  }
  
  const token = config.GARAK_API_KEY;
  if (!token) {
    throw new Error(__('missing_api_key'));
  }
  
  // 서버 URL 설정
  const serverUrl = config.BASE_URL ? `${config.BASE_URL}/api/send` : "https://garak.wwwai.site/api/send";
  
  console.log(chalk.cyan(__('email_sending', { email })));
  
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
    console.log(result);
    console.log(chalk.green(__('email_success')));
    return result;
  } catch (error) {
    throw new Error(__('email_error', { error: error.message }));
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
  console.log(chalk.green(__('add_result', { a, b, result })));
  return result;
} 