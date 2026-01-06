import { Timer } from './timer.js';

// DOM 요소
const progressCircle = document.querySelector('.progress-ring-circle');
const timerText = document.querySelector('.timer-text');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const skipBtn = document.getElementById('skipBtn');

// 원형 진행 바 설정
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
progressCircle.style.strokeDasharray = CIRCUMFERENCE;

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

// 1분(60초) 타이머 생성
const timer = new Timer(60);

// 타이머 콜백
timer.onTick = (remainingSeconds, percentage) => {
    timerText.textContent = formatTime(remainingSeconds);
    updateProgress(percentage);
    console.log(`남은 시간: ${formatTime(remainingSeconds)} (${percentage.toFixed(0)}%)`);
};

timer.onComplete = () => {
    console.log('완료!');
    updateButtons(false, true);
    timerText.textContent = '완료!';
};

// 버튼 이벤트
startBtn.addEventListener('click', () => {
    timer.start();
    updateButtons(true, false);
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
    timer.skip();
});

// 초기화
console.log('앱 시작됨');
timerText.textContent = formatTime(timer.duration);
updateProgress(100);
