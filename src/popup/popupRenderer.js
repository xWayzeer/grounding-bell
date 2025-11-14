const instruction = document.getElementById('instruction');
const timerEl = document.getElementById('timer');
const nextBtn = document.getElementById('nextBtn');
const exerciseIcon = document.getElementById('exerciseIcon');
const progressDots = document.getElementById('progressDots');
const breathingCircle = document.getElementById('breathingCircle');

const minBtn = document.getElementById("min-btn");
const maxBtn = document.getElementById("max-btn");
const closeBtn = document.getElementById("close-btn");

const techniques = {
    "5-4-3-2-1": [
      { text: 'Take a moment to relax and center yourself', type: 'next', icon: '🧘‍♀️' },
      { text: 'Look around and name 5 things you can see', type: 'next', icon: '👁️' },
      { text: 'Touch and feel 4 objects around you', type: 'next', icon: '✋' },
      { text: 'Listen and identify 3 sounds you can hear', type: 'next', icon: '👂' },
      { text: 'Notice 2 things you can smell', type: 'next', icon: '👃' },
      { text: 'Focus on 1 thing you can taste', type: 'next', icon: '👅' }
    ],
    "4-7-8": [
      { text: 'Prepare for 4-7-8 breathing', type: 'next', icon: '🌬️' },
      { text: 'Breathe in through your nose', type: 'next', icon: '😌', breathIn: true },
      { text: 'Hold your breath', duration: 7, type: 'breathing', icon: '⏸️', hold: true },
      { text: 'Exhale slowly through your mouth', type: 'next', icon: '😮‍💨', breathOut: true },
      { text: 'Breathe in through your nose', type: 'next', icon: '😌', breathIn: true },
      { text: 'Hold your breath', duration: 7, type: 'breathing', icon: '⏸️', hold: true },
      { text: 'Exhale slowly through your mouth', type: 'next', icon: '😮‍💨', breathOut: true },
      { text: 'Breathe in through your nose', type: 'next', icon: '😌', breathIn: true },
      { text: 'Hold your breath', duration: 7, type: 'breathing', icon: '⏸️', hold: true },
      { text: 'Exhale slowly through your mouth', type: 'next', icon: '😮‍💨', breathOut: true }
    ],
    "box": [
      { text: 'Prepare for box breathing', type: 'next', icon: '📦' },
      { text: 'Inhale through your nose. Fill your lungs with air', type: 'next', icon: '😌', breathIn: true },
      { text: 'Hold your breath', duration: 4, type: 'breathing', icon: '⏸️', hold: true },
      { text: 'Exhale slowly through your mouth', type: 'next', icon: '😮‍💨', breathOut: true },
      { text: 'Inhale through your nose. Fill your lungs with air', type: 'next', icon: '😌', breathIn: true },
      { text: 'Hold your breath', duration: 4, type: 'breathing', icon: '⏸️', hold: true },
      { text: 'Exhale slowly through your mouth', type: 'next', icon: '😮‍💨', breathOut: true },
      { text: 'Inhale through your nose. Fill your lungs with air', type: 'next', icon: '😌', breathIn: true },
      { text: 'Hold your breath', duration: 4, type: 'breathing', icon: '⏸️', hold: true },
      { text: 'Exhale slowly through your mouth', type: 'next', icon: '😮‍💨', breathOut: true },
    ]
};

minBtn.addEventListener("click", () => {
    window.popupRenderer.minimize();
});

maxBtn.addEventListener("click", () => {
    window.popupRenderer.maximize();
});

closeBtn.addEventListener("click", () => {
    window.popupRenderer.close();
});

let currentStep = 0;
let currentTechnique = [];
let currentInterval = null;

// Receive technique from main process
if (window.popupRenderer) {
    window.popupRenderer.onData((value) => {
        currentTechnique = techniques[value];
        
        currentStep = 0;
        initProgressDots();
        showStep(currentStep);
    });
}

// Initialize progress dots
function initProgressDots() {
    progressDots.innerHTML = '';
    currentTechnique.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (index === 0) dot.classList.add('active');
        progressDots.appendChild(dot);
    });
}

// Update progress dots
function updateProgressDots() {
    const dots = progressDots.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentStep);
    });
}
  
function showStep(step) {
    const item = currentTechnique[step];

    if (!item) {
        window.close();
        return;
    }

    if (currentInterval) {
        clearInterval(currentInterval);
        currentInterval = null;
    }

    exerciseIcon.style.animation = 'none';
    setTimeout(() => {
        exerciseIcon.textContent = item.icon;
        exerciseIcon.style.animation = 'float 3s ease-in-out infinite';
    }, 10);

    instruction.textContent = item.text;
    updateProgressDots();

    if (item.type === 'countdown' || item.type === 'breathing') {
        let timeLeft = item.duration;
        timerEl.querySelector('.timer-value').textContent = timeLeft;
        timerEl.style.display = 'block';
        nextBtn.style.display = 'none';
        breathingCircle.classList.remove('active');

        if (item.type === 'breathing') {
        breathingCircle.classList.add('active');
        if (item.breathIn) {
            breathingCircle.style.animation = `breathe ${item.duration}s ease-in-out 1`;
        } else if (item.breathOut) {
            breathingCircle.style.animation = `breathe ${item.duration}s ease-in-out 1 reverse`;
        } else if (item.hold) {
            breathingCircle.style.animation = 'none';
            breathingCircle.style.transform = 'scale(1.15)';
        }
        }

        currentInterval = setInterval(() => {
        timeLeft--;
        timerEl.querySelector('.timer-value').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(currentInterval);
            currentInterval = null;
            currentStep++;
            showStep(currentStep);
        }
        }, 1000);
    } else if (item.type === 'next') {
        timerEl.style.display = 'none';
        breathingCircle.classList.remove('active');
        nextBtn.style.display = 'inline-block';
    }
}

nextBtn.addEventListener('click', () => {
    currentStep++;
    showStep(currentStep);
});