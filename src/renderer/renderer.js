let selectedBell = 'tibetan';
let selectedTechnique = '5-4-3-2-1';
let totalSeconds = 0;
let bellVolume = 0.1;

const timerDisplay = document.getElementById('timerDisplay');
const minutesInput = document.getElementById('minutesInput');
const secondsInput = document.getElementById('secondsInput');

const bellOptions = document.querySelectorAll('.bell-option');
const volumeSlider = document.getElementById("volumeSlider");

const gtOptions = document.querySelectorAll('.gt-option');

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

const settingsBtn = document.getElementById('settings-btn');
const homeBtn = document.getElementById('home-btn');
const homePage = document.getElementById('home');
const settingsPage = document.getElementById('settings');

const feedbackBtn = document.getElementById('feedback');
const privacyBtn = document.getElementById('privacy');
const helpBtn = document.getElementById('help');

const minBtn = document.getElementById("min-btn");
const maxBtn = document.getElementById("max-btn");
const closeBtn = document.getElementById("close-btn");

const sendFeedback = document.getElementById('sendFeedback');
const feedbackInput = document.getElementById('feedbackInput')
const statusMessage = document.getElementById('statusMessage');

async function loadSettings() {
    selectedBell = await window.renderer.get("selectedBell", "tibetan");
    selectedTechnique = await window.renderer.get("selectedTechnique", '5-4-3-2-1');
    const volume = await window.renderer.get("volume", 0.1);
    const durMinutes = await window.renderer.get("durMinutes", 30);
    const durSeconds = await window.renderer.get("durSeconds", 0);

    bellOptions.forEach(option => {
        const sound = option.getAttribute("data-sound");
        option.classList.toggle("selected", sound === selectedBell);
    });

    gtOptions.forEach(option => {
        const technique = option.getAttribute("data-technique");
        console.log("tech", technique)
        option.classList.toggle("selected", technique === selectedTechnique);
    });

    volumeSlider.value = volume ?? 10;
    bellVolume = volume ?? 10;

    minutesInput.value = durMinutes ?? 0;
    secondsInput.value = durSeconds ?? 0;


    const time = durMinutes * 60 + durSeconds;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

document.addEventListener("DOMContentLoaded", loadSettings);

minBtn.addEventListener("click", () => {
    window.renderer.minimize();
});

maxBtn.addEventListener("click", () => {
    window.renderer.maximize();
});

closeBtn.addEventListener("click", () => {
    window.renderer.close();
});

settingsBtn.addEventListener('click', () => {
    homePage.style.display = 'none';
    settingsPage.style.display = 'block';

    settingsBtn.classList.remove('selected');
    homeBtn.classList.add('selected');
});

homeBtn.addEventListener('click', () => {
    settingsPage.style.display = 'none';
    homePage.style.display = 'block';

    settingsBtn.classList.add('selected');
    homeBtn.classList.remove('selected');
});

// Bell selection
bellOptions.forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.bell-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        selectedBell = option.dataset.sound;
        window.renderer.setBell(selectedBell);
    });
});

volumeSlider.addEventListener("input", (e) => {
    bellVolume = e.target.value / 100;
    window.renderer.set("volume", e.target.value);
});

// Technique selection
gtOptions.forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.gt-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        selectedTechnique = option.dataset.technique;
        window.renderer.setTechnique(selectedTechnique);
    });
});

// Start timer
startBtn.addEventListener('click', () => {
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;

    window.renderer.set("durMinutes", minutes);
    window.renderer.set("durSeconds", seconds);

    if (minutes === 0 && seconds === 0) {
        alert('Please set a valid time');
        return;
    }

    totalSeconds = minutes * 60 + seconds;
    window.renderer.startTimer(totalSeconds);

    startBtn.disabled = true;
    stopBtn.disabled = false;
});

// Stop timer
stopBtn.addEventListener('click', () => {
    window.renderer.stopTimer();
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

// Play bell
function playBell(selectedBell) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-10, audioContext.currentTime);
    compressor.knee.setValueAtTime(10, audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, audioContext.currentTime);
    compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);

    const masterGain = audioContext.createGain();
    masterGain.gain.value = Math.min(bellVolume * 2, 0.8);
    
    compressor.connect(masterGain);
    masterGain.connect(audioContext.destination);

    const bellSounds = {
        tibetan: {
            frequencies: [220, 440, 660, 880],
            type: 'sine',
            decay: 4,
            delays: [0, 0.1, 0.15, 0.2],
            volumes: [0.6, 0.4, 0.25, 0.15]
        },
        chime: {
            frequencies: [523.25, 659.25, 783.99, 1046.50],
            type: 'triangle',
            decay: 3,
            delays: [0, 0.3, 0.6, 0.9],
            volumes: [0.5, 0.35, 0.25, 0.15]
        },
        gong: {
            frequencies: [65, 130, 195, 260],
            type: 'sine',
            decay: 6,
            delays: [0, 0.05, 0.1, 0.15],
            volumes: [0.7, 0.5, 0.3, 0.2]
        },
        singing: {
            frequencies: [432, 540, 648],
            type: 'sine',
            decay: 5,
            delays: [0, 0.2, 0.4],
            volumes: [0.6, 0.4, 0.25]
        },
        crystal: {
            frequencies: [1046.50, 1318.51, 1567.98],
            type: 'sine',
            decay: 4,
            delays: [0, 0.15, 0.3],
            volumes: [0.5, 0.35, 0.2]
        },
        zen: {
            frequencies: [174, 348, 522],
            type: 'sine',
            decay: 5,
            delays: [0, 0.25, 0.5],
            volumes: [0.65, 0.45, 0.3]
        }
    };

    const bell = bellSounds[selectedBell] || bellSounds.tibetan;

    bell.frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(compressor);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = bell.type;

        const startTime = audioContext.currentTime + bell.delays[index];
        const initialVolume = bell.volumes[index];
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(initialVolume, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + bell.decay);

        oscillator.start(startTime);
        oscillator.stop(startTime + bell.decay);
    });
}

window.renderer.onPlayBell((selectedBell) => {
    playBell(selectedBell);
});

// Handle timer updates
window.renderer.onTimerUpdate((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

window.renderer.onTimerEnd(() => {
    const notes = notesInput.value.trim() || "Take a deep breath and center yourself in this moment. You are safe, you are present.";
    reminderNotes.textContent = notes;
    reminderPopup.style.display = 'flex';
});

window.renderer.onTimerStopped(() => {
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    totalSeconds = minutes * 60 + seconds;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

feedbackBtn.addEventListener('click', function() {
    showPage('feedback');
});

privacyBtn.addEventListener('click', function() {
    showPage('privacy');
});

helpBtn.addEventListener('click', function() {
    showPage('help');
});


function showPage(tabName) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.style.display = 'none');

    const navItems = document.querySelectorAll('.settings-page .sidebar li');
    navItems.forEach(item => item.classList.remove('selected'));

    const selectedPage = document.getElementById(tabName + "-tab");
    selectedPage.style.display = 'block';

    const selectedNavItem = document.getElementById(tabName);
    selectedNavItem.classList.add('selected');
}

sendFeedback.addEventListener('click', () => {
    const feedback = feedbackInput.value.trim();
    if (!feedback) {
        statusMessage.style.color = '#F44336';
        statusMessage.textContent = 'Please enter some feedback before sending.';
        return;
    }

    sendFeedback.disabled = true;
    statusMessage.style.color = 'gray';
    statusMessage.textContent = 'Sending feedback...';

    window.renderer.sendFeedback(feedback);
});

window.renderer.onFeedbackResponse((response) => {
    sendFeedback.disabled = false;

    if (response.status === 'success') {
        feedbackInput.value = '';
        statusMessage.style.color = '#4CAF50';
        statusMessage.textContent = '✅ Feedback sent successfully. Thank you!';
    } else if (response.status === 'rateLimit') {
        statusMessage.style.color = '#F44336';
        statusMessage.textContent = response.message;
    } else {
        statusMessage.style.color = '#F44336';
        statusMessage.textContent = '❌ Failed to send feedback. Please try again.';
    }
})