import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';

/**
 * Windows에서 프로그램 설치 여부 및 위치 확인
 * @param {string} programName - 찾을 프로그램 이름
 * @returns {object} - 설치 여부와 위치 정보
 */
export function checkWindowsProgram(programName) {
  if (os.platform() !== 'win32') {
    throw new Error('이 메서드는 Windows에서만 동작합니다');
  }

  const result = {
    installed: false,
    location: null,
    version: null,
    debug: {} // 디버깅 정보 추가
  };

  // Claude의 일반적인 설치 경로 확인
  if (programName === 'Claude') {
    const possiblePaths = [
      path.join(os.homedir(), 'AppData', 'Local', 'AnthropicClaude', 'claude.exe'),
      path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Claude', 'Claude.exe'),
      path.join('C:', 'Program Files', 'Claude', 'Claude.exe'),
      path.join('C:', 'Program Files (x86)', 'Claude', 'Claude.exe')
    ];

    result.debug.searchPaths = possiblePaths;

    for (const claudePath of possiblePaths) {
      result.debug.checking = claudePath;
      if (fs.existsSync(claudePath)) {
        result.installed = true;
        result.location = claudePath;
        try {
          // Windows에서 파일 버전 정보 추출
          const versionCommand = `powershell -command "(Get-Item '${claudePath}').VersionInfo.FileVersion"`;
          result.version = execSync(versionCommand, { encoding: 'utf-8' }).trim();
          result.debug.versionCommand = versionCommand;
          result.debug.versionSuccess = true;
        } catch (error) {
          result.debug.versionError = error.message;
        }
        return result;
      }
    }

    // 레지스트리에서 Claude 검색
    try {
      const regPaths = [
        'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Claude.exe',
        'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\claude.exe'
      ];

      for (const regPath of regPaths) {
        try {
          const command = `reg query "${regPath}" /ve`;
          const output = execSync(command, { encoding: 'utf-8' });
          result.debug.registrySearch = { path: regPath, output };
          
          const match = output.match(/REG_SZ\s+(.+)/);
          if (match) {
            const exePath = match[1].trim();
            if (fs.existsSync(exePath)) {
              result.installed = true;
              result.location = exePath;
              return result;
            }
          }
        } catch (error) {
          result.debug.registryError = error.message;
        }
      }
    } catch (error) {
      result.debug.registrySearchError = error.message;
    }
  }

  return result;
}

/**
 * macOS에서 프로그램 설치 여부 및 위치 확인
 * @param {string} programName - 찾을 프로그램 이름
 * @returns {object} - 설치 여부와 위치 정보
 */
export function checkMacProgram(programName) {
  if (os.platform() !== 'darwin') {
    throw new Error('이 메서드는 macOS에서만 동작합니다');
  }

  const result = {
    installed: false,
    location: null,
    version: null
  };

  // Claude의 일반적인 설치 경로 확인
  if (programName === 'Claude') {
    const possiblePaths = [
      '/Applications/Claude.app',
      path.join(os.homedir(), 'Applications', 'Claude.app')
    ];

    for (const claudePath of possiblePaths) {
      if (fs.existsSync(claudePath)) {
        result.installed = true;
        result.location = claudePath;
        
        // 버전 정보 추출 시도
        try {
          const infoPlistPath = path.join(claudePath, 'Contents/Info.plist');
          if (fs.existsSync(infoPlistPath)) {
            const versionCommand = `/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" "${infoPlistPath}"`;
            result.version = execSync(versionCommand, { encoding: 'utf-8' }).trim();
          }
        } catch (error) {
          // 버전 정보 추출 실패는 무시
        }
        
        return result;
      }
    }
  }

  try {
    // Spotlight를 사용하여 앱 검색
    const mdfindCommand = `mdfind "kMDItemKind == 'Application'" -name "${programName}"`;
    const mdfindOutput = execSync(mdfindCommand, { encoding: 'utf-8' });
    
    if (mdfindOutput.trim()) {
      const locations = mdfindOutput.split('\n').filter(Boolean);
      if (locations.length > 0) {
        result.installed = true;
        result.location = locations[0]; // 첫 번째 발견된 위치 사용
        
        // 버전 정보 추출 시도
        try {
          const infoPlistPath = path.join(result.location, 'Contents/Info.plist');
          if (fs.existsSync(infoPlistPath)) {
            const versionCommand = `/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" "${infoPlistPath}"`;
            result.version = execSync(versionCommand, { encoding: 'utf-8' }).trim();
          }
        } catch (error) {
          // 버전 정보 추출 실패는 무시
        }
        
        return result;
      }
    }

    return result;
  } catch (error) {
    return result;
  }
}

/**
 * 운영체제에 맞는 프로그램 설치 확인 함수 호출
 * @param {string} programName - 찾을 프로그램 이름
 * @returns {object} - 설치 여부와 위치 정보
 */
export function checkProgramInstallation(programName) {
  const platform = os.platform();
  
  try {
    if (platform === 'win32') {
      return checkWindowsProgram(programName);
    } else if (platform === 'darwin') {
      return checkMacProgram(programName);
    } else {
      throw new Error('지원되지 않는 운영체제입니다');
    }
  } catch (error) {
    return {
      installed: false,
      location: null,
      version: null,
      error: error.message
    };
  }
}

/**
 * Windows 환경 감지
 * @returns {string} - 'mingw' | 'powershell' | 'cmd' | 'unknown'
 */
function detectWindowsEnv() {
  try {
    // MINGW 환경 확인
    if (process.env.MSYSTEM) {
      return 'mingw';
    }

    // PowerShell 환경 확인
    try {
      execSync('powershell $PSVersionTable', { stdio: 'pipe' });
      return 'powershell';
    } catch {
      // PowerShell 명령이 실패하면 CMD로 가정
      return 'cmd';
    }
  } catch {
    return 'unknown';
  }
}

/**
 * Windows에서 프로세스 종료
 * @param {string} env - Windows 환경 ('mingw' | 'powershell' | 'cmd')
 * @returns {boolean} - 성공 여부
 */
function killWindowsProcess(env) {
  try {
    const commands = {
      mingw: 'taskkill //F //IM "claude.exe" 2>/dev/null || taskkill //F //IM "Claude.exe" 2>/dev/null',
      powershell: 'Stop-Process -Name "claude" -Force -ErrorAction SilentlyContinue; Stop-Process -Name "Claude" -Force -ErrorAction SilentlyContinue',
      cmd: 'taskkill /F /IM "claude.exe" 2>nul || taskkill /F /IM "Claude.exe" 2>nul'
    };

    const command = commands[env] || commands.cmd;
    
    if (env === 'powershell') {
      execSync(`powershell -Command "${command}"`, { stdio: 'pipe' });
    } else {
      execSync(command, { stdio: 'pipe' });
    }
    
    console.log('프로세스 종료 성공 (환경:', env, ')');
    return true;
  } catch (error) {
    console.log('프로세스 종료 시도 중 오류 (이미 종료되었을 수 있음):', error.message);
    return false;
  }
}

/**
 * Windows에서 프로세스 시작
 * @param {string} env - Windows 환경
 * @param {string} exePath - 실행 파일 경로
 */
function startWindowsProcess(env, exePath) {
  const commands = {
    mingw: `start "" "${exePath.replace(/\\/g, '/')}"`,
    powershell: `Start-Process "${exePath}"`,
    cmd: `start "" "${exePath}"`
  };

  const command = commands[env] || commands.cmd;
  
  if (env === 'powershell') {
    execSync(`powershell -Command "${command}"`, { stdio: 'pipe' });
  } else {
    execSync(command, { stdio: 'pipe' });
  }
}

/**
 * Claude Desktop 프로그램 재시작
 * @returns {object} - 재시작 성공 여부와 메시지
 */
export async function restartClaudeDesktop() {
  const platform = os.platform();
  const claudeInfo = checkProgramInstallation('Claude');
  
  console.log('재시작 디버그 정보:', {
    platform,
    claudeInfo
  });
  
  if (!claudeInfo.installed) {
    return {
      success: false,
      message: 'Claude Desktop이 설치되어 있지 않습니다.',
      debug: claudeInfo.debug
    };
  }

  try {
    if (platform === 'win32') {
      const windowsEnv = detectWindowsEnv();
      console.log('감지된 Windows 환경:', windowsEnv);

      // Windows에서 프로세스 종료
      killWindowsProcess(windowsEnv);
      
      // 잠시 대기 후 재시작
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Claude 재시작
      console.log('재시작 시도:', claudeInfo.location);
      startWindowsProcess(windowsEnv, claudeInfo.location);
      
      return {
        success: true,
        message: 'Claude Desktop이 성공적으로 재시작되었습니다.',
        debug: {
          environment: windowsEnv,
          exePath: claudeInfo.location
        }
      };
      
    } else if (platform === 'darwin') {
      // macOS에서 프로세스 종료 및 재시작
      try {
        execSync('pkill -f "Claude"', { stdio: 'pipe' });
        console.log('프로세스 종료 성공');
      } catch (error) {
        console.log('프로세스 종료 시도 중 오류 (이미 종료되었을 수 있음):', error.message);
      }
      
      // 잠시 대기 후 재시작
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Claude 재시작
      execSync('open -a Claude', { stdio: 'pipe' });
      
      return {
        success: true,
        message: 'Claude Desktop이 성공적으로 재시작되었습니다.'
      };
    }
    
    return {
      success: false,
      message: '지원되지 않는 운영체제입니다.'
    };
    
  } catch (error) {
    return {
      success: false,
      message: `재시작 중 오류가 발생했습니다: ${error.message}`,
      debug: {
        errorDetails: error.stack
      }
    };
  }
} 