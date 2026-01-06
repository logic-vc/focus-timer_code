import { Timer } from './timer.js';
import {
    loadTasks,
    getCurrentTask,
    getNextTask,
    moveToNextTask,
    updateTaskStatus,
    addTask,
    deleteTask,
    setCurrentIndex,
    resetData
} from './storage.js';

// DOM 요소 - Focus View
const focusView = document.getElementById('focusView');
const editView = document.getElementById('editView');
const progressCircle = document.querySelector('.progress-ring-circle');
const timerText = document.querySelector('.timer-text');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const skipBtn = document.getElementById('skipBtn');
const currentTaskTitle = document.getElementById('currentTaskTitle');
const nextTaskTitle = document.getElementById('nextTaskTitle');
const settingsBtn = document.getElementById('settingsBtn');

// DOM 요소 - Edit View
const backBtn = document.getElementById('backBtn');
const taskInput = document.getElementById('taskInput');
const durationSelect = document.getElementById('durationSelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const startFocusBtn = document.getElementById('startFocusBtn');

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

// 분 단위 포맷팅
function formatMinutes(seconds) {
    const mins = Math.floor(seconds / 60);
    return `${mins}분`;
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

    currentTaskTitle.textContent = current ? current.title : '작업 없음';
    nextTaskTitle.textContent = next ? next.title : '-';
}

// 뷰 전환
function showView(view) {
    focusView.classList.remove('active');
    editView.classList.remove('active');

    if (view === 'focus') {
        focusView.classList.add('active');
    } else {
        editView.classList.add('active');
        renderTaskList();
    }
}

// 작업 리스트 렌더링
function renderTaskList() {
    const data = loadTasks();
    taskList.innerHTML = '';

    if (data.tasks.length === 0) {
        taskList.innerHTML = '<li class="empty-message">작업을 추가해주세요</li>';
        return;
    }

    data.tasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <div class="task-item-info">
                <span class="task-item-title">${task.title}</span>
                <span class="task-item-duration">${formatMinutes(task.duration)}</span>
            </div>
            <button class="btn-delete" data-id="${task.id}">✕</button>
        `;
        taskList.appendChild(li);
    });
}

// 타이머 초기화
function initTimer() {
    const currentTask = getCurrentTask();

    if (!currentTask) {
        timerText.textContent = '00:00';
        updateProgress(100);
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

// === 이벤트 리스너 ===

// Focus View 버튼
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

// 설정 버튼 (Focus → Edit)
settingsBtn.addEventListener('click', () => {
    if (timer && timer.isRunning) {
        timer.pause();
    }
    showView('edit');
});

// 돌아가기 버튼 (Edit → Focus)
backBtn.addEventListener('click', () => {
    showView('focus');
    updateTaskDisplay();
    initTimer();
});

// 작업 추가
addTaskBtn.addEventListener('click', () => {
    const title = taskInput.value.trim();
    const minutes = parseInt(durationSelect.value, 10);

    if (!title) {
        taskInput.focus();
        return;
    }

    addTask(title, minutes);
    taskInput.value = '';
    renderTaskList();
    console.log(`작업 추가: ${title} (${minutes}분)`);
});

// Enter 키로 작업 추가
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click();
    }
});

// 작업 삭제 (이벤트 위임)
taskList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const id = e.target.dataset.id;
        deleteTask(id);
        renderTaskList();
        console.log(`작업 삭제: ${id}`);
    }
});

// 포커스 시작 버튼
startFocusBtn.addEventListener('click', () => {
    const data = loadTasks();
    if (data.tasks.length === 0) {
        alert('작업을 먼저 추가해주세요.');
        return;
    }

    // 첫 번째 pending 작업으로 이동
    setCurrentIndex(0);
    showView('focus');
    updateTaskDisplay();
    initTimer();
});

// === 앱 초기화 ===
console.log('앱 시작됨');

// 기존 데이터 로드 (없으면 더미 데이터 생성)
const data = loadTasks();
console.log('작업 목록:', data.tasks.map(t => `${t.title} (${t.duration}초)`));

// Edit View로 시작 (작업이 없거나 처음 시작할 때)
if (data.tasks.length === 0) {
    showView('edit');
} else {
    showView('focus');
    updateTaskDisplay();
    initTimer();
}
