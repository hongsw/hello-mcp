import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// __dirname 설정 (ES 모듈에서는 자동으로 제공되지 않음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MCP 서버를 시작하는 함수
 */
export async function startServer() {
  // mcpServer.js 파일 경로
  const serverScriptPath = path.join(__dirname, 'mcpServer.js');
  
  // 파일 존재 확인
  if (!fs.existsSync(serverScriptPath)) {
    throw new Error(`MCP 서버 스크립트를 찾을 수 없습니다: ${serverScriptPath}`);
  }
  
  // MCP 서버 실행
  const serverProcess = spawn('node', [serverScriptPath], {
    stdio: 'inherit', // 표준 입출력을 부모 프로세스와 공유
    shell: true
  });
  
  // 프로세스 종료 시 처리
  serverProcess.on('close', (code) => {
    // 종료 코드가 0이 아닌 경우에도 로그를 출력하지 않음
  });
  
  // 프로세스 에러 처리
  serverProcess.on('error', (err) => {
    console.error('MCP 서버 실행 중 오류 발생:', err);
  });
  
  // 서버 시작 시간 대기
  return new Promise(resolve => {
    setTimeout(() => {
      // 서버가 시작되면 true 반환
      resolve(true);
    }, 1000);
  });
} 