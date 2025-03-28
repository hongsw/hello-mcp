import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { time } from 'console';
import { checkProgramInstallation } from './programLocator.js';

// Claude Desktop이 설치되어 있는지 확인
function isClaudeDesktopInstalled() {
  const result = checkProgramInstallation('Claude');
  
  if (result.error) {
    console.log(`프로그램 확인 중 오류 발생: ${result.error}`);
    return false;
  }

  if (!result.installed) {
    const platform = process.platform;
    console.log('\n[Claude Desktop 설치 확인]');
    console.log('- 상태: 설치되지 않음');
    console.log('- 운영체제:', platform === 'win32' ? 'Windows' : platform === 'darwin' ? 'macOS' : '기타');
    
    if (platform === 'win32') {
      console.log('\n일반적인 설치 경로:');
      console.log(`- ${os.homedir()}\\AppData\\Local\\AnthropicClaude\\claude.exe`);
    } else if (platform === 'darwin') {
      console.log('\n일반적인 설치 경로:');
      console.log('- /Applications/Claude.app');
      console.log(`- ${os.homedir()}/Applications/Claude.app`);
    }
    
    console.log('\n다운로드: https://claude.ai/download');
    return false;
  }

  console.log('\n[Claude Desktop 설치 확인]');
  console.log('- 상태: 설치됨');
  console.log(`- 설치 위치: ${result.location}`);
  if (result.version) {
    console.log(`- 버전: ${result.version}`);
  }
  
  return true;
}

// Claude Desktop 재시작
function restartClaudeDesktop() {
  return new Promise((resolve, reject) => {
    // OS별 명령어
    let command = '';
    
    
    if (process.platform === 'darwin') { // macOS
      command = 'pkill -f "Claude" && sleep 1.5 && open -a Claude';
    } else if (process.platform === 'win32') { // Windows
      command = 'taskkill /F /IM "Claude.exe" && timeout /t 2 && start "" "Claude.exe"';
    } else { // Linux or other OS
      console.log('Linux에서는 Claude Desktop을 수동으로 재시작해주세요.');
      resolve(false);
      return;
    }
    
    console.log('Restarting Claude Desktop...');
    exec(command, (error) => {
      if (error) {
        // 실행 중인 Claude가 없는 경우 - 오류가 아님
        if (error.code === 1) {
          // Claude 시작
          let startCommand = '';
          if (process.platform === 'darwin') {
            startCommand = 'open -a Claude';
          } else if (process.platform === 'win32') {
            startCommand = 'start "" "Claude.exe"';
          }
          
          exec(startCommand, (startError) => {
            if (startError) {
              console.log('Claude Desktop을 시작할 수 없습니다. 수동으로 실행해주세요.');
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } else {
          console.log('Claude Desktop을 재시작할 수 없습니다. 수동으로 재시작해주세요.');
          resolve(false);
        }
      } else {
        resolve(true);
      }
    });
  });
}

// 오류 메시지 및 해결 가이드 제공
function getTroubleshootingGuide(errorType) {
  const guides = {
    'claude-service-disruption': {
      title: 'Claude Service Disruption',
      description: 'Claude Desktop에서 "Claude will return Soon, Claude ai is currently experiencing a temporary service disruption" 오류가 발생했습니다.',
      steps: [
        '1. Claude Desktop 앱을 완전히 종료한 후 다시 시작해보세요.',
        '2. 인터넷 연결 상태를 확인하세요.',
        '3. 앤트로픽(Anthropic)의 서비스 상태 확인: https://status.anthropic.com/',
        '4. 문제가 지속되면 몇 시간 후에 다시 시도하세요. 앤트로픽 서버의 일시적인 문제일 수 있습니다.'
      ]
    },
    'website-invalid': {
      title: 'Website Invalid',
      description: '웹사이트 접속 중 오류가 발생했습니다.',
      steps: [
        '1. 인터넷 연결 상태를 확인하세요.',
        '2. 브라우저 캐시를 삭제한 후 다시 시도해보세요.',
        '3. 다른 브라우저를 사용해보세요.',
        '4. 아래 주소로 직접 접속해보세요: https://garak.ai/getting-started',
        '5. 오류가 지속되면 help@garak.ai로 문의해주세요.'
      ]
    },
    'email-error': {
      title: 'Email Sending Error',
      description: '이메일 전송 중 오류가 발생했습니다.',
      steps: [
        '1. 이메일 주소가 올바른지 확인하세요.',
        '2. 인터넷 연결 상태를 확인하세요.',
        '3. API 키가 유효한지 확인하세요. `npx hello-mcp` 명령어로 새 API 키를 발급받을 수 있습니다.',
        '4. 메시지 본문이 너무 길면(200자 이상) 분할하여 전송해보세요.',
        '5. 오류가 지속되면 help@garak.ai로 문의해주세요.'
      ]
    }
  };
  
  return guides[errorType] || {
    title: 'General Troubleshooting',
    description: '문제가 발생했습니다.',
    steps: [
      '1. Claude Desktop을 재시작해보세요.',
      '2. 인터넷 연결을 확인하세요.',
      '3. `npx hello-mcp` 명령어로 설정을 다시 실행해보세요.',
      '4. 문제가 지속되면 help@garak.ai 또는 GitHub 이슈(https://github.com/hongsw/hello-mcp/issues)로 문의해주세요.'
    ]
  };
}

export {
  restartClaudeDesktop,
  isClaudeDesktopInstalled,
  getTroubleshootingGuide
};