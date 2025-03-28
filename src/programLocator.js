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
    version: null
  };

  // Claude의 일반적인 설치 경로 확인
  if (programName === 'Claude') {
    const possiblePaths = [
      path.join(os.homedir(), 'AppData', 'Local', 'AnthropicClaude', 'claude.exe')
    ];

    for (const claudePath of possiblePaths) {
      if (fs.existsSync(claudePath)) {
        result.installed = true;
        result.location = claudePath;
        try {
          // Windows에서 파일 버전 정보 추출
          const versionCommand = `powershell -command "(Get-Item '${claudePath}').VersionInfo.FileVersion"`;
          result.version = execSync(versionCommand, { encoding: 'utf-8' }).trim();
        } catch (error) {
          // 버전 정보 추출 실패는 무시
        }
        return result;
      }
    }
  }

  try {
    // 레지스트리를 통해 프로그램 확인 (32비트 및 64비트)
    const registryPaths = [
      'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
    ];

    for (const regPath of registryPaths) {
      try {
        const command = `reg query "${regPath}" /s /f "${programName}"`;
        const output = execSync(command, { encoding: 'utf-8' });
        
        if (output.includes(programName)) {
          result.installed = true;
          
          // 설치 경로 추출 시도
          const locationMatch = output.match(/InstallLocation\s+REG_SZ\s+(.+)/);
          if (locationMatch) {
            result.location = locationMatch[1].trim();
          }
          
          // 버전 정보 추출 시도
          const versionMatch = output.match(/DisplayVersion\s+REG_SZ\s+(.+)/);
          if (versionMatch) {
            result.version = versionMatch[1].trim();
          }
          
          break;
        }
      } catch (error) {
        // 레지스트리 검색 실패는 무시하고 계속 진행
        continue;
      }
    }

    return result;
  } catch (error) {
    // 모든 검색 방법이 실패한 경우
    return result;
  }
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
 * @returns {object} - 환경 정보
 */
function detectWindowsEnv() {
  const result = {
    type: 'unknown',
    shell: process.env.SHELL || 'unknown',
    term: process.env.TERM || 'unknown',
    msystem: process.env.MSYSTEM || 'none',
    debug: {}
  };

  try {
    // MINGW 환경 확인
    if (process.env.MSYSTEM) {
      result.type = 'mingw';
      result.debug.msystem = process.env.MSYSTEM;
    }

    // PowerShell 환경 확인
    try {
      const psOutput = execSync('powershell $PSVersionTable', { stdio: 'pipe' }).toString();
      result.type = 'powershell';
      result.debug.powershell = psOutput;
    } catch (error) {
      result.debug.powershellError = error.message;
      // PowerShell 명령이 실패하면 CMD로 가정
      result.type = 'cmd';
    }

    // 추가 환경 정보 수집
    try {
      result.debug.path = process.env.PATH;
      result.debug.pwd = process.cwd();
      result.debug.home = os.homedir();
    } catch (error) {
      result.debug.envError = error.message;
    }

  } catch (error) {
    result.debug.error = error.message;
  }

  console.log('감지된 Windows 환경:', result);
  return result;
}

/**
 * Windows에서 프로세스 종료
 * @param {object} env - Windows 환경 정보
 * @returns {object} - 실행 결과
 */
function killWindowsProcess(env) {
  const result = {
    success: false,
    commands: [],
    outputs: [],
    errors: []
  };

  try {
    const commands = {
      mingw: [
        'taskkill //F //IM "claude.exe" 2>/dev/null',
        'taskkill //F //IM "Claude.exe" 2>/dev/null',
        'taskkill //F //IM "AnthropicClaude.exe" 2>/dev/null'
      ],
      powershell: [
        'Stop-Process -Name "claude" -Force -ErrorAction SilentlyContinue',
        'Stop-Process -Name "Claude" -Force -ErrorAction SilentlyContinue',
        'Stop-Process -Name "AnthropicClaude" -Force -ErrorAction SilentlyContinue'
      ],
      cmd: [
        'taskkill /F /IM "claude.exe" 2>nul',
        'taskkill /F /IM "Claude.exe" 2>nul',
        'taskkill /F /IM "AnthropicClaude.exe" 2>nul'
      ]
    };

    const commandList = commands[env.type] || commands.cmd;
    
    for (const cmd of commandList) {
      try {
        result.commands.push(cmd);
        if (env.type === 'powershell') {
          const output = execSync(`powershell -Command "${cmd}"`, { stdio: 'pipe' }).toString();
          result.outputs.push(output);
        } else {
          const output = execSync(cmd, { stdio: 'pipe' }).toString();
          result.outputs.push(output);
        }
        result.success = true;
      } catch (error) {
        result.errors.push(error.message);
      }
    }

    // 프로세스 목록 확인
    try {
      if (env.type === 'powershell') {
        const processes = execSync('powershell -Command "Get-Process | Where-Object { $_.Name -like \'*claude*\' } | Select-Object Name, Id"', { stdio: 'pipe' }).toString();
        result.runningProcesses = processes;
      } else {
        const processes = execSync('tasklist | findstr /i "claude"', { stdio: 'pipe' }).toString();
        result.runningProcesses = processes;
      }
    } catch (error) {
      result.processListError = error.message;
    }

    console.log('프로세스 종료 결과:', result);
    return result;
  } catch (error) {
    result.errors.push(error.message);
    console.log('프로세스 종료 오류:', result);
    return result;
  }
}

/**
 * Windows에서 프로세스 시작
 * @param {object} env - Windows 환경 정보
 * @param {string} exePath - 실행 파일 경로
 * @returns {object} - 실행 결과
 */
function startWindowsProcess(env, exePath) {
  const result = {
    success: false,
    command: '',
    output: '',
    error: null
  };

  try {
    const commands = {
      mingw: `start "" "${exePath.replace(/\\/g, '/')}"`,
      powershell: `Start-Process "${exePath}"`,
      cmd: `start "" "${exePath}"`
    };

    const command = commands[env.type] || commands.cmd;
    result.command = command;
    
    if (env.type === 'powershell') {
      result.output = execSync(`powershell -Command "${command}"`, { stdio: 'pipe' }).toString();
    } else {
      result.output = execSync(command, { stdio: 'pipe' }).toString();
    }
    
    result.success = true;

    // 프로세스 시작 확인
    setTimeout(() => {
      try {
        if (env.type === 'powershell') {
          const processes = execSync('powershell -Command "Get-Process | Where-Object { $_.Name -like \'*claude*\' } | Select-Object Name, Id"', { stdio: 'pipe' }).toString();
          result.runningProcesses = processes;
        } else {
          const processes = execSync('tasklist | findstr /i "claude"', { stdio: 'pipe' }).toString();
          result.runningProcesses = processes;
        }
      } catch (error) {
        result.processCheckError = error.message;
      }
    }, 1000);

    console.log('프로세스 시작 결과:', result);
    return result;
  } catch (error) {
    result.error = error.message;
    console.log('프로세스 시작 오류:', result);
    return result;
  }
}

/**
 * Claude Desktop 프로그램 재시작
 * @returns {object} - 재시작 성공 여부와 메시지
 */
export async function restartClaudeDesktop() {
  const result = {
    success: false,
    platform: os.platform(),
    debug: {
      env: process.env,
      cwd: process.cwd(),
      home: os.homedir()
    }
  };

  try {
    console.log('재시작 시작 - 플랫폼:', result.platform);
    
    const claudeInfo = checkProgramInstallation('Claude');
    result.claudeInfo = claudeInfo;
    
    if (!claudeInfo.installed) {
      result.message = 'Claude Desktop이 설치되어 있지 않습니다.';
      console.log('설치 확인 실패:', result);
      return result;
    }

    if (result.platform === 'win32') {
      const windowsEnv = detectWindowsEnv();
      result.windowsEnv = windowsEnv;
      console.log('Windows 환경 감지됨:', windowsEnv);

      // Windows에서 프로세스 종료
      const killResult = killWindowsProcess(windowsEnv);
      result.killResult = killResult;
      
      // 잠시 대기 후 재시작
      console.log('2초 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Claude 재시작
      console.log('재시작 시도:', claudeInfo.location);
      const startResult = startWindowsProcess(windowsEnv, claudeInfo.location);
      result.startResult = startResult;
      
      if (startResult.success) {
        result.success = true;
        result.message = 'Claude Desktop이 성공적으로 재시작되었습니다.';
      } else {
        result.message = `재시작 실패: ${startResult.error}`;
      }
      
    } else if (result.platform === 'darwin') {
      // macOS 처리 코드는 그대로 유지
      // ... existing macOS code ...
    } else {
      result.message = '지원되지 않는 운영체제입니다.';
    }
    
  } catch (error) {
    result.success = false;
    result.message = `재시작 중 오류가 발생했습니다: ${error.message}`;
    result.error = {
      message: error.message,
      stack: error.stack
    };
  }

  console.log('최종 재시작 결과:', result);
  return result;
} 