import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { time } from 'console';

// Claude Desktop이 설치되어 있는지 확인
function isClaudeDesktopInstalled() {
  const platform = process.platform;
  let claudePath = '';
  
  if (platform === 'darwin') { // macOS
    claudePath = '/Applications/Claude.app';
  } else if (platform === 'win32') { // Windows
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    claudePath = path.join(programFiles, 'Claude', 'Claude.exe');
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const alternativePath = path.join(programFilesX86, 'Claude', 'Claude.exe');
    
    if (fs.existsSync(alternativePath)) {
      return true;
    }
  } else { // Linux
    const homedir = os.homedir();
    claudePath = path.join(homedir, '.local', 'share', 'Claude', 'Claude');
  }
  
  return fs.existsSync(claudePath);
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

export {
  restartClaudeDesktop,
  isClaudeDesktopInstalled
};