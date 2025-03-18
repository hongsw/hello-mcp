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
  // mcp-server.js 파일 경로
  const serverScriptPath = path.join(__dirname, 'mcp-server.js');
  
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
    if (code !== 0) {
      console.log(`MCP 서버가 종료되었습니다. 종료 코드: ${code}`);
    }
  });
  
  // 프로세스 에러 처리
  serverProcess.on('error', (err) => {
    console.error('MCP 서버 실행 중 오류 발생:', err);
  });
  
  // 서버 시작 시간 대기
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('MCP 서버가 시작되었습니다.');
      resolve(true);
    }, 1000);
  });
} 