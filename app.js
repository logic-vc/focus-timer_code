import { Timer } from './timer.js';
import {
    loadTasks,
    getCurrentTask,
    getNextTask,
    moveToNextTask,
    updateTaskStatus,
    resetData
} from './storage.js';

// DOM 요소
const progressCircle = document.querySelector('.progress-ring-circle');
const timerText = document.querySelector('.timer-text');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const skipBtn = document.getElementById('skipBtn');
const currentTaskTitle = document.getElementById('currentTaskTitle');
const nextTaskTitle = document.getElementById('nextTaskTitle');

// 원형 진행 바 설정
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
progressCircle.style.strokeDasharray = CIRCUMFERENCE;

// 타이머 인스턴스
let timer = null;

// 시간 포맷팅 (MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// 진행 바 업데이트
function updateProgress(percentage) {
    const offset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
    progressCircle.style.strokeDashoffset = offset;
}

// 버튼 상태 업데이트
function updateButtons(isRunning, isComplete) {
    startBtn.disabled = isRunning || isComplete;
    pauseBtn.disabled = !isRunning;
    skipBtn.disabled = isComplete;
    pauseBtn.textContent = '일시정지';
}

// 작업 정보 표시 업데이트
function updateTaskDisplay() {
    const current = getCurrentTask();
    const next = getNextTask();

    currentTaskTitle.textContent = current ? current.title : '모든 작업 완료!';
    nextTaskTitle.textContent = next ? next.title : '-';
}

// 타이머 초기화
function initTimer() {
    const currentTask = getCurrentTask();

    if (!currentTask) {
        timerText.textContent = '완료!';
        updateProgress(0);
        updateButtons(false, true);
        return;
    }

    // 기존 타이머 정리
    if (timer) {
        timer.pause();
    }

    timer = new Timer(currentTask.duration);

    timer.onTick = (remainingSeconds, percentage) => {
        timerText.textContent = formatTime(remainingSeconds);
        updateProgress(percentage);
        console.log(`[${currentTask.title}] ${formatTime(remainingSeconds)} (${percentage.toFixed(0)}%)`);
    };

    timer.onComplete = () => {
        console.log(`[${currentTask.title}] 완료!`);
        updateTaskStatus(currentTask.id, 'completed');

        // 다음 작업으로 자동 전환
        const nextTask = moveToNextTask();
        if (nextTask) {
            console.log(`다음 작업: ${nextTask.title}`);
            updateTaskDisplay();
            initTimer();
            // 자동 시작
            timer.start();
            updateButtons(true, false);
            updateTaskStatus(nextTask.id, 'active');
        } else {
            updateTaskDisplay();
            timerText.textContent = '완료!';
            updateProgress(0);
            updateButtons(false, true);
        }
    };

    // 초기 표시
    timerText.textContent = formatTime(currentTask.duration);
    updateProgress(100);
    updateButtons(false, false);
}

// 버튼 이벤트
startBtn.addEventListener('click', () => {
    const currentTask = getCurrentTask();
    if (currentTask && timer) {
        timer.start();
        updateButtons(true, false);
        updateTaskStatus(currentTask.id, 'active');
    }
});

pauseBtn.addEventListener('click', () => {
    if (timer.isRunning) {
        timer.pause();
        pauseBtn.textContent = '재개';
        updateButtons(false, false);
        pauseBtn.disabled = false;
    } else {
        timer.resume();
        pauseBtn.textContent = '일시정지';
        updateButtons(true, false);
    }
});

skipBtn.addEventListener('click', () => {
    if (timer) {
        timer.skip();
    }
});

// 앱 초기화
console.log('앱 시작됨');

// 테스트용: 데이터 초기화 (새로운 더미 데이터로 시작)
resetData();

const data = loadTasks();
console.log('작업 목록:', data.tasks.map(t => `${t.title} (${t.duration}초)`));

updateTaskDisplay();
initTimer();
