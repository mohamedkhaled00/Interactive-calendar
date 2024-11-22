// Variables
let audioPlayer;
let currentStation = 0;
let isFullscreen = false;
let hasStarted = false;
let isMuted = false;
let currentAudio = null;

// Stations data
const stations = [
  { id: 1, name: 'Basketball session', details: 'Enjoy watching a basketball game at the playground.', location: 'Basketball Court', icon: 'fa-futbol' },
  { id: 2, name: 'Reception – School Specialization PowerPoint & Parents Testimonials, Private Sector Remarks (VIP Room)', details: 'Learn about the school specialization through a presentation, hear testimonials from parents, and listen to remarks from private sector VIPs.', location: 'VIP Room, Ground Floor', icon: 'fa-handshake' },
  { id: 3, name: 'Art Gallery', details: 'Admire artistic works displayed in the Art Gallery.', location: 'Art Room', icon: 'fa-palette' },
  { id: 4, name: 'Computer Vision Lab', details: 'Visit the Computer Vision Lab and explore innovative technologies.', location: 'Hall 1 - Main Building', icon: 'fa-desktop' },
  { id: 5, name: 'Virtual Reality (VR) Experience', details: 'Immerse yourself in our state-of-the-art Virtual Reality (VR) setups. Explore interactive simulations, educational programs, and entertainment experiences that showcase the latest in VR technology.', location: 'Hall 2 - Main Building', icon: 'fa-vr-cardboard' },
  { id: 6, name: 'Career Development Center: Employment and Internships', details: 'Explore employment and internship opportunities at the Career Development Center.', location: 'CDC Room', icon: 'fa-briefcase' },
  { id: 7, name: 'Capstone Expo', details: "View students' capstone projects on display.", location: 'Expo Hall', icon: 'fa-project-diagram' },
  { id: 8, name: 'Wall of Fame, Student Testimonials and Group Photo', details: 'Celebrate student achievements at the Wall of Fame and take a group photo.', location: 'Ground Floor', icon: 'fa-camera' },
  { id: 9, name: 'PHP Station: Safeguarding Session', details: 'Participate in a safeguarding session at the PHP Station.', location: 'Garden', icon: 'fa-shield-alt' },
  { id: 10, name: 'Upper Egyptian Show', details: 'Enjoy a cultural performance showcasing Upper Egyptian heritage.', location: 'Garden, Ground Floor', icon: 'fa-theater-masks' }
];

// Play audio for the current station
function playStationAudio() {
    const stationId = stations[currentStation].id;
    const audioFileName = stationId === 'break' ? 'break.mp3' : `Station-${stationId}.mp3`;
    const audioPath = `usaid/audio/${audioFileName}`;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(audioPath);

    if (isMuted) {
        currentAudio.muted = true;
    }

    currentAudio.addEventListener('canplaythrough', () => {
        currentAudio.play().catch(error => {
            console.error("Failed to play audio:", error);
        });
    });

    currentAudio.addEventListener('error', (e) => {
        console.error("Error loading audio:", e.target.error);
    });
}

// Initialize App
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    try {
        loadProgress();
        if (currentStation > 0) {
            hasStarted = true;
        }
        await handleWelcomeScreen();
        renderStations();
        showFullscreenModal();
        addEventListeners();
        improveResponsiveness();
        showStartJourneyButton();
    } catch (error) {
        console.error('Initialization Error:', error);
    }
}

// Handle Welcome Screen
function handleWelcomeScreen() {
    return new Promise((resolve) => {
        const welcomeScreen = document.getElementById('welcomeScreen');
        setTimeout(() => {
            welcomeScreen.style.animation = 'fadeOut 1s ease-out forwards';
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                resolve();
            }, 1000);
        }, 3000);
    });
}

// Render Stations
function renderStations() {
    const stationsContainer = document.getElementById('stations');
    stationsContainer.innerHTML = '';

    stations.forEach((station, index) => {
        const isLeft = index % 2 === 0;
        const stationCard = document.createElement('div');
        stationCard.className = `station-card ${isLeft ? 'left' : 'right'}`;

        const isCompleted = index < currentStation;
        const isCurrent = index === currentStation;
        const isLocked = index > currentStation;

        stationCard.innerHTML = `
            <div class="station-content glass-effect ${isCurrent ? 'current-station' : ''} ${isLocked ? 'locked' : ''}">
                <div class="station-status">
                    ${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Locked'}
                </div>
                <div class="station-icon">
                    <i class="fas ${station.icon}"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">
                    ${station.name}
                </h3>
                <p class="mb-3">
                    ${station.location}
                </p>
                <p>
                    ${station.details.substring(0, 100)}...
                </p>
                ${!isLocked ? `
                <button class="info-button btn btn-usaid mt-4" data-station="${index}">
                    <i class="fas fa-info-circle mr-2"></i> View Details
                </button>` : ''}
            </div>
        `;

        stationsContainer.appendChild(stationCard);

        // Add Event Listener to Info Button
        if (!isLocked) {
            const infoButton = stationCard.querySelector('.info-button');
            if (infoButton) {
                infoButton.addEventListener('click', (e) => {
                    const stationIndex = parseInt(e.currentTarget.getAttribute('data-station'));
                    showModal(stations[stationIndex]);
                });
            }
        }
    });

    scrollToStation(currentStation);
    updateProgress();
    updateCurrentStationInfo();
}

// Update Progress Bar
function updateProgress() {
    const progress = (currentStation / (stations.length - 1)) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${Math.round(progress)}% Complete - Exploring ${stations[currentStation].name}`;
}

// Update Current Station Info
function updateCurrentStationInfo() {
    const currentStationInfo = document.getElementById('currentStationInfo');
    const currentStationDetails = document.getElementById('currentStationDetails');
    const currentStationIcon = document.getElementById('currentStationIcon');
    const currentStationName = document.getElementById('currentStationName');

    currentStationDetails.textContent = stations[currentStation].details;
    currentStationIcon.className = `fas ${stations[currentStation].icon} fa-2x`;
    currentStationName.textContent = stations[currentStation].name;

    currentStationInfo.classList.remove('hidden');
}

// Event Listeners
function addEventListeners() {
    document.getElementById('startJourney').addEventListener('click', startJourney);
    document.getElementById('nextStationFooterBtn').addEventListener('click', nextStation);
    document.getElementById('restartTour').addEventListener('click', restartTour);
    document.getElementById('resetTour').addEventListener('click', resetTourWithConfirmation);
    document.getElementById('confirmReset').addEventListener('click', resetTour);
    document.getElementById('cancelReset').addEventListener('click', hideResetConfirmModal);

    document.getElementById('closeModal').addEventListener('click', hideModal);
    document.getElementById('enterFullscreen').addEventListener('click', () => {
        toggleFullscreen();
        hideFullscreenModal();
    });
    document.getElementById('closeFullscreenModal').addEventListener('click', hideFullscreenModal);

    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.remove('hidden');
        document.getElementById('mobileMenu').classList.add('flex');
    });

    document.getElementById('closeMobileMenu').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.add('hidden');
        document.getElementById('mobileMenu').classList.remove('flex');
    });

    document.getElementById('muteAudio').addEventListener('click', toggleMute);

    window.addEventListener('resize', improveResponsiveness);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
}

// Start Journey
function startJourney() {
    hasStarted = true;
    document.getElementById('startJourney').classList.add('hidden');
    document.getElementById('nextStationFooter').classList.remove('hidden');
    playStationAudio();
    renderStations();
    scrollToStation(currentStation);
}

// Next Station
function nextStation() {
    if (currentStation < stations.length - 1) {
        currentStation++;
        saveProgress();
        renderStations();
        scrollToStation(currentStation);
        playStationAudio();
    } else {
        showTourEnd();
    }
}

// Restart Tour
function restartTour() {
    currentStation = 0;
    saveProgress();
    document.getElementById('tourEnd').classList.add('hidden');
    document.getElementById('stations').classList.remove('hidden');
    renderStations();
}

// Reset Tour
function resetTour() {
    currentStation = 0;
    hasStarted = false;
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    saveProgress();

    document.getElementById('currentStationInfo').classList.add('hidden');
    document.getElementById('nextStationFooter').classList.add('hidden');
    document.getElementById('startJourney').classList.remove('hidden');

    renderStations();
    hideResetConfirmModal();
}

// Show Tour End
function showTourEnd() {
    document.getElementById('stations').classList.add('hidden');
    document.getElementById('currentStationInfo').classList.add('hidden');
    document.getElementById('nextStationFooter').classList.add('hidden');
    document.getElementById('tourEnd').classList.remove('hidden');
    confettiCelebration();
}

// Toggle Mute
function toggleMute() {
    isMuted = !isMuted;
    const muteIcon = document.getElementById('muteAudio').querySelector('i');
    if (isMuted) {
        muteIcon.classList.remove('fa-volume-up');
        muteIcon.classList.add('fa-volume-mute');
        if (currentAudio) currentAudio.pause();
    } else {
        muteIcon.classList.remove('fa-volume-mute');
        muteIcon.classList.add('fa-volume-up');
        if (currentAudio) currentAudio.play();
    }
}

// Modal Management
function showModal(station) {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = station.name;
    document.getElementById('modalDetails').textContent = station.details;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Fullscreen Management
function showFullscreenModal() {
    if (!isFullscreen) {
        document.getElementById('fullscreenModal').classList.remove('hidden');
        document.getElementById('fullscreenModal').classList.add('flex');
    }
}

function hideFullscreenModal() {
    document.getElementById('fullscreenModal').classList.add('hidden');
    document.getElementById('fullscreenModal').classList.remove('flex');
}

function handleFullscreenChange() {
    if (!document.fullscreenElement) {
        isFullscreen = false;
        showFullscreenModal();
    } else {
        isFullscreen = true;
    }
}

// Scroll to Station
function scrollToStation(stationIndex) {
    const stationElements = document.querySelectorAll('.station-card');
    if (stationElements[stationIndex]) {
        stationElements[stationIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Responsiveness Improvements
function improveResponsiveness() {
    // Implement any necessary responsive adjustments here
}

// Save and Load Progress
function saveProgress() {
    try {
        localStorage.setItem('currentStation', currentStation);
    } catch (error) {
        console.error('Failed to save progress:', error);
    }
}

function loadProgress() {
    const saved = localStorage.getItem('currentStation');
    if (saved !== null) {
        currentStation = parseInt(saved, 10);
    }
}

// Reset Confirmation Modal
function resetTourWithConfirmation() {
    const modal = document.getElementById('resetConfirmModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideResetConfirmModal() {
    const modal = document.getElementById('resetConfirmModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Confetti Celebration
function confettiCelebration() {
    var end = Date.now() + (10 * 1000); // 10 seconds
    var colors = ['#bb0000', '#ffffff'];

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Show Start Journey Button
function showStartJourneyButton() {
    const startButton = document.getElementById('startJourney');
    const nextStationFooter = document.getElementById('nextStationFooter');

    if (!hasStarted) {
        startButton.classList.remove('hidden');
        nextStationFooter.classList.add('hidden');
    } else {
        startButton.classList.add('hidden');
        nextStationFooter.classList.remove('hidden');
    }
}

// Toggle Fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}