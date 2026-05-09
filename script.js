const sessions = {
    Lundi: {
        title: 'Repos et Mobilité',
        duration: '30 min (optionnel)',
        intensity: 'Z0',
        type: 'Repos',
        sport: 'ppg',
        workout: null,
        description: 'Focus sur la récupération. Étirements légers et travail de mobilité pour préparer la séance intense de demain.'
    },
    Mardi: {
        title: 'Intervalles Haute Intensité',
        duration: '1h15',
        intensity: 'Z4 / Z5',
        type: 'Intervalles',
        sport: 'velo',
        workout: '15min Warm-up / 6x (3min @ 110% FTP + 3min récupération) / 10min Cool-down',
        description: 'Améliorer la puissance brute pour que le 37 km/h devienne une allure de confort.'
    },
    Mercredi: {
        title: 'Repos Complet',
        duration: '0 min',
        intensity: '-',
        type: 'Repos',
        sport: 'repos',
        workout: null,
        description: 'Repos total nécessaire pour l\'assimilation des fibres musculaires.'
    },
    Jeudi: {
        title: 'Travail au Seuil (Tempo)',
        duration: '1h30',
        intensity: 'Z3 / Z4',
        type: 'Seuil',
        sport: 'velo',
        workout: '20min Warm-up / 3x 15min @ 90% FTP (cadence 90) / 10min Cool-down',
        description: 'Développer l\'endurance de force nécessaire pour maintenir la vitesse sur 90 km.'
    },
    Vendredi: {
        title: 'Repos ou Stretching',
        duration: '20 min',
        intensity: 'Z0',
        type: 'Repos',
        sport: 'ppg',
        workout: null,
        description: 'Préparation mentale et physique pour la sortie longue du weekend.'
    },
    Samedi: {
        title: 'Sortie Longue Spécifique',
        duration: '3h30 - 4h00',
        intensity: 'Z2 / Z3',
        type: 'Sortie Longue',
        sport: 'velo',
        workout: 'Maintenir la position aéro 80% du temps. Intégrer 2x 20min à allure course (37 km/h).',
        description: 'Simulation de course. Test de nutrition et d\'hydratation impératif.'
    },
    Dimanche: {
        title: 'Récupération Active',
        duration: '1h00',
        intensity: 'Z1',
        type: 'Récupération',
        sport: 'velo',
        workout: 'Pédalage souple, RPM > 95. Terrain plat uniquement.',
        description: 'Drainage lymphatique pour éliminer les toxines de la semaine.'
    }
};

const weeklyLoad = [45, 75, 30, 90, 20, 220, 60];
const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const defaultAccounts = {
    athlete1: { password: 'velo2027', displayName: 'NOM_ATHLETE_1', role: 'athlete' },
    athlete2: { password: 'force37', displayName: 'NOM_ATHLETE_2', role: 'athlete' },
    coach: { password: 'trainadmin', displayName: 'Entraîneur', role: 'admin' }
};

const accounts = { ...defaultAccounts };
const assignedPrograms = {};
let currentUser = null;

let athleteEntries = [];

const dayButtons = document.querySelectorAll('.day-card');
const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');
const detailElement = document.getElementById('session-detail');
const refreshButton = document.getElementById('refresh-chart');
const trainingCanvas = document.getElementById('trainingChart');
const progressCanvas = document.getElementById('progressChart');
const athleteProgressCanvas = document.getElementById('athleteProgressChart');
const performanceForm = document.getElementById('performance-form');
const clearFormButton = document.getElementById('clear-form');
const athleteTableBody = document.querySelector('#athlete-table tbody');
const athleteTotalEl = document.getElementById('athlete-total');
const bestSpeedEl = document.getElementById('best-speed');
const totalEntriesEl = document.getElementById('total-entries');
const athleteCountEl = document.getElementById('athlete-count');
const loginScreen = document.getElementById('loginScreen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');
const authToggleButtons = document.querySelectorAll('.auth-toggle-btn');
const logoutBtn = document.getElementById('logout-btn');
const userBanner = document.getElementById('user-banner');
const userNameDisplay = document.getElementById('user-name');
const userRoleDisplay = document.getElementById('user-role');
const profilePhoto = document.getElementById('profile-photo');
const sessionUploadCard = document.getElementById('session-upload-card');
const sessionUploadForm = document.getElementById('session-upload-form');
const sessionFileInput = document.getElementById('session-file-input');
const athleteSelector = document.getElementById('athlete-selector');
const assignedSessionsSection = document.getElementById('assigned-sessions-section');
const assignedSessionsList = document.getElementById('assigned-sessions-list');
const athleteAccountList = document.getElementById('athlete-account-list');
const adminAthleteListCard = document.getElementById('admin-athlete-list-card');
const athleteNameInput = performanceForm.querySelector('[name="name"]');

function updateSession(day) {
    dayButtons.forEach(button => button.classList.toggle('active', button.dataset.day === day));
    const session = sessions[day];
    const workoutHtml = session.workout ? `<div class="workout-box">${session.workout}</div>` : '';

    detailElement.innerHTML = `
        <div class="detail-header">
            <div>
                <h2>${day} — ${session.title}</h2>
                <p>Durée estimée : <strong>${session.duration}</strong></p>
            </div>
            <span class="tag">Intensité ${session.intensity}</span>
        </div>
        <p>${session.description}</p>
        ${workoutHtml}
    `;
}

function parseStravaPhoto(file) {
    const fileName = file.name.toLowerCase();
    const kmMatch = fileName.match(/(\d+[\.,]?\d*)\s?km/);
    const minMatch = fileName.match(/(\d+)\s?(min|mn|m)/);
    if (kmMatch && minMatch) {
        const distance = parseFloat(kmMatch[1].replace(',', '.'));
        const duration = parseInt(minMatch[1], 10);
        const speed = Number((distance / (duration / 60)).toFixed(1));
        return { distance, duration, speed, source: 'Photo Strava' };
    }
    return { source: 'Photo Strava', inferred: false };
}

function getAverageSpeed(distance, duration, manualSpeed) {
    if (manualSpeed && manualSpeed > 0) {
        return Number(manualSpeed.toFixed(1));
    }
    return Number(((distance / (duration / 60)) || 0).toFixed(1));
}

function addPerformanceEntry(entry) {
    athleteEntries.unshift(entry);
    saveAthleteEntryToDatabase(entry);
    updateAthleteTable();
    updateCoachStats();
    drawProgressChart();
    drawAthleteProgressChart();
}

function setActiveTab(tabId) {
    tabButtons.forEach(button => {
        const isActive = button.dataset.tab === tabId;
        button.classList.toggle('active', isActive);
    });

    panels.forEach(panel => {
        const isActive = panel.id === tabId;
        panel.classList.toggle('active', isActive);
        panel.setAttribute('aria-hidden', !isActive);
    });
}

function getVisibleEntries() {
    if (currentUser && currentUser.role === 'athlete') {
        return athleteEntries.filter(entry => entry.username === currentUser.username);
    }
    return athleteEntries;
}

function updateAthleteTable() {
    const visibleEntries = getVisibleEntries();
    athleteTableBody.innerHTML = visibleEntries.map(entry => `
        <tr>
            <td>${entry.name}</td>
            <td>${entry.date}</td>
            <td>${entry.distance} km</td>
            <td>${entry.duration} min</td>
            <td>${entry.speed} km/h</td>
            <td>${entry.water ? `${entry.water} L` : '-'}</td>
            <td>${entry.drink ? `${entry.drink} ml` : '-'}</td>
            <td>${entry.food ? entry.food : '-'}</td>
            <td>${entry.source}</td>
        </tr>
    `).join('');
}

function updateCoachStats() {
    const visibleEntries = getVisibleEntries();
    const athleteNames = new Set(visibleEntries.map(entry => entry.name.trim().toLowerCase()));
    athleteTotalEl.textContent = athleteNames.size;
    athleteCountEl.textContent = athleteNames.size;
    totalEntriesEl.textContent = visibleEntries.length;
    const bestSpeed = visibleEntries.reduce((max, entry) => Math.max(max, entry.speed), 0);
    bestSpeedEl.textContent = bestSpeed ? `${bestSpeed}` : '0';
}

function updateUserContext() {
    if (!currentUser) return;
    userBanner.hidden = false;
    userNameDisplay.textContent = `Connecté : ${currentUser.displayName}`;
    userRoleDisplay.textContent = currentUser.role === 'admin' ? 'Entraîneur' : 'Athlète';
    
    // Charger la photo de profil
    loadProfilePhoto(currentUser.username);
    
    sessionUploadCard.hidden = currentUser.role !== 'admin';
    adminAthleteListCard.hidden = currentUser.role !== 'admin';
    assignedSessionsSection.hidden = false;
    if (currentUser.role === 'athlete') {
        athleteNameInput.value = currentUser.displayName;
        athleteNameInput.disabled = true;
        athleteSelector.value = currentUser.username;
        athleteSelector.disabled = true;
        renderAssignedSessions(currentUser.username);
    } else {
        athleteNameInput.disabled = false;
        athleteSelector.disabled = false;
        populateAthleteSelector();
        renderAssignedSessions(athleteSelector.value || currentUser.username);
        renderAthleteAccounts();
    }
}

function renderAssignedSessions(username) {
    const key = username?.trim().toLowerCase();
    const sessions = key ? assignedPrograms[key] || [] : [];
    if (!sessions.length) {
        assignedSessionsList.innerHTML = '<p class="hint-text">Aucune séance assignée pour le moment.</p>';
        return;
    }

    assignedSessionsList.innerHTML = sessions.map(session => {
        const sportClass = session.sport ? `sport-${session.sport}` : '';
        return `
        <article class="session-card ${sportClass}">
            <h3>${session.day || session.title || 'Séance'}</h3>
            <p><strong>${session.title || 'Programme'}</strong></p>
            <p>${session.duration || ''} · ${session.intensity || ''}</p>
            <p>${session.description || ''}</p>
            ${session.workout ? `<p>${session.workout}</p>` : ''}
        </article>
    `}).join('');
}

function openLoginScreen() {
    loginScreen.classList.remove('hidden');
    document.body.classList.add('no-scroll');
}

function closeLoginScreen() {
    loginScreen.classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

// 🔥 FIREBASE - Sauvegarder la session utilisateur
function saveUserToDatabase() {
    if (currentUser && typeof db !== 'undefined') {
        db.ref('users').child(currentUser.username).set({
            username: currentUser.username,
            displayName: currentUser.displayName,
            role: currentUser.role,
            lastLogin: firebase.database.ServerValue.TIMESTAMP
        }).catch(error => {
            console.error('Erreur sauvegarde utilisateur:', error);
        });
    }
    // Garder aussi en localStorage pour accès rapide
    if (currentUser) {
        localStorage.setItem('suivi-athlete-user', JSON.stringify({ username: currentUser.username }));
    }
}

// 🔥 FIREBASE - Sauvegarder les comptes athlètes
function saveAccountsToDatabase() {
    if (typeof db === 'undefined') return;
    
    const storedAccounts = {};
    Object.entries(accounts).forEach(([key, account]) => {
        if (defaultAccounts[key] && defaultAccounts[key].role === 'admin') {
            storedAccounts[key] = account;
            return;
        }
        if (account.role === 'athlete') {
            storedAccounts[key] = account;
        }
    });
    
    db.ref('accounts').set(storedAccounts).catch(error => {
        console.error('Erreur sauvegarde comptes:', error);
    });
    
    // Aussi localStorage
    localStorage.setItem('suivi-athlete-accounts', JSON.stringify(storedAccounts));
}

function saveAssignedPrograms() {
    localStorage.setItem('suivi-athlete-programs', JSON.stringify(assignedPrograms));
    if (typeof db !== 'undefined') {
        db.ref('assignedPrograms').set(assignedPrograms).catch(error => {
            console.error('Erreur sauvegarde séances assignées:', error);
        });
    }
}

// 🔥 FIREBASE - Enregistrer une performance
function saveAthleteEntryToDatabase(entry) {
    if (typeof db === 'undefined') {
        console.error('Firebase non initialisé. Vérifiez firebase-config.js');
        return;
    }
    
    if (!currentUser) {
        console.error('Utilisateur non authentifié');
        return;
    }
    
    const entryId = Date.now().toString();
    db.ref('performances').child(entryId).set({
        ...entry,
        username: currentUser.username,
        displayName: currentUser.displayName,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        console.log('Performance enregistrée avec succès:', entryId);
    }).catch(error => {
        console.error('Erreur enregistrement Firebase:', error);
        alert(`Erreur lors de la sauvegarde: ${error.message}`);
    });
}

// 🔥 FIREBASE - Écouter les performances en temps réel
function listenToAthleteEntries() {
    if (typeof db === 'undefined') {
        console.error('Firebase non initialisé');
        return;
    }
    
    db.ref('performances').orderByChild('timestamp').on('value', (snapshot) => {
        athleteEntries = [];
        snapshot.forEach(childSnapshot => {
            const entry = childSnapshot.val();
            athleteEntries.unshift(entry);
        });
        updateAthleteTable();
        updateCoachStats();
        if (currentUser && currentUser.role === 'admin') {
            drawProgressChart();
            drawAthleteProgressChart();
        }
    }, (error) => {
        console.error('Erreur lecture Firebase:', error);
    });
}

function loadAccountsFromStorage() {
    try {
        const stored = localStorage.getItem('suivi-athlete-accounts');
        if (!stored) return;
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([username, account]) => {
            accounts[username] = account;
        });
    } catch (error) {
        console.warn('Impossible de charger les comptes utilisateurs', error);
    }
}

function populateAthleteSelector() {
    if (!athleteSelector) return;
    const athletes = Object.entries(accounts).filter(([, account]) => account.role === 'athlete');
    athleteSelector.innerHTML = '<option value="">Sélectionner un athlète</option>' + athletes.map(([username, account]) => `
        <option value="${username}">${account.displayName}</option>
    `).join('');
    if (currentUser && currentUser.role === 'admin' && athletes.length) {
        athleteSelector.value = athletes[0][0];
        renderAssignedSessions(athleteSelector.value);
    }
}

function renderAthleteAccounts() {
    if (!athleteAccountList) return;
    const athletes = Object.entries(accounts).filter(([, account]) => account.role === 'athlete');
    if (!athletes.length) {
        athleteAccountList.innerHTML = '<p class="hint-text">Aucun compte athlète enregistré pour le moment.</p>';
        return;
    }
    athleteAccountList.innerHTML = athletes.map(([username, account]) => `
        <article class="session-card">
            <h3>${account.displayName}</h3>
            <p>Identifiant : ${username}</p>
            <p>Sessions assignées : ${assignedPrograms[username]?.length || 0}</p>
        </article>
    `).join('');
}

function toggleAuthMode(mode) {
    authToggleButtons.forEach(button => {
        const isActive = button.dataset.auth === mode;
        button.classList.toggle('active', isActive);
    });
    if (loginForm && registerForm) {
        loginForm.classList.toggle('hidden', mode !== 'login');
        registerForm.classList.toggle('hidden', mode !== 'register');
    }
    loginError.textContent = '';
    registerError.textContent = '';
}

function loadAssignedPrograms() {
    try {
        const stored = localStorage.getItem('suivi-athlete-programs');
        if (stored) {
            const parsed = JSON.parse(stored);
            Object.assign(assignedPrograms, parsed);
        }
    } catch (error) {
        console.warn('Impossible de charger les séances assignées', error);
    }
}

// 🔥 FIREBASE - Charger les données depuis Firebase
function loadUserFromDatabase() {
    loadAccountsFromStorage();
    loadAssignedPrograms();
    
    // Écouter les performances en temps réel
    listenToAthleteEntries();
    
    // Écouter les nouveaux comptes athlètes
    if (typeof db !== 'undefined') {
        db.ref('accounts').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                Object.assign(accounts, data);
            }
            populateAthleteSelector();
            renderAthleteAccounts();
        });

        db.ref('assignedPrograms').on('value', (snapshot) => {
            const data = snapshot.val();
            Object.keys(assignedPrograms).forEach(key => delete assignedPrograms[key]);
            if (data) {
                Object.assign(assignedPrograms, data);
            }
            renderAssignedSessions(currentUser?.username || athleteSelector.value || '');
            renderAthleteAccounts();
        });
    }
    
    populateAthleteSelector();
    renderAthleteAccounts();
    const stored = localStorage.getItem('suivi-athlete-user');
    if (!stored) {
        openLoginScreen();
        return;
    }

    try {
        const saved = JSON.parse(stored);
        if (saved && saved.username && accounts[saved.username]) {
            currentUser = { username: saved.username, ...accounts[saved.username] };
            closeLoginScreen();
            updateUserContext();
            updateAthleteTable();
            updateCoachStats();
            return;
        }
    } catch (error) {
        console.warn('Erreur lecture du stockage local', error);
    }

    openLoginScreen();
}

function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const username = formData.get('username').trim().toLowerCase();
    const password = formData.get('password');
    const account = accounts[username];

    if (!account || account.password !== password) {
        loginError.textContent = 'Identifiant ou mot de passe incorrect.';
        return;
    }

    currentUser = { username, ...account };
    loginError.textContent = '';
    closeLoginScreen();
    saveUserToDatabase();
    populateAthleteSelector();
    updateUserContext();
    updateAthleteTable();
    updateCoachStats();
}

// 🔥 FIREBASE - Uploader la photo de profil
async function uploadProfilePhoto(file, username) {
    if (typeof firebase === 'undefined' || !firebase.storage) {
        console.error('Firebase Storage non initialisé');
        return null;
    }
    
    try {
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`profiles/${username}/${file.name}`);
        await fileRef.put(file);
        const photoURL = await fileRef.getDownloadURL();
        return photoURL;
    } catch (error) {
        console.error('Erreur upload photo:', error);
        return null;
    }
}

// Charger et afficher la photo de profil
async function loadProfilePhoto(username) {
    if (typeof firebase === 'undefined' || !firebase.storage || !profilePhoto) {
        return;
    }
    
    try {
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`profiles/${username}/`);
        const result = await fileRef.listAll();
        
        if (result.items.length > 0) {
            const photoURL = await result.items[0].getDownloadURL();
            profilePhoto.src = photoURL;
            profilePhoto.style.display = 'block';
        } else {
            profilePhoto.style.display = 'none';
        }
    } catch (error) {
        console.warn('Impossible de charger la photo:', error);
        profilePhoto.style.display = 'none';
    }
}

function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const displayName = formData.get('displayName').trim();
    const username = formData.get('newUsername').trim().toLowerCase();
    const password = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    const profilePhotoFile = formData.get('profilePhoto');

    if (!displayName || !username || !password || !confirmPassword) {
        registerError.textContent = 'Tous les champs sont requis.';
        return;
    }
    if (password !== confirmPassword) {
        registerError.textContent = 'Les mots de passe ne correspondent pas.';
        return;
    }
    if (accounts[username]) {
        registerError.textContent = 'Cet identifiant est déjà utilisé.';
        return;
    }
    if (username === 'coach' || username === 'admin' || username === 'entraineur') {
        registerError.textContent = 'Choisissez un autre identifiant.';
        return;
    }

    accounts[username] = { password, displayName, role: 'athlete' };
    
    // Upload photo si fournie
    if (profilePhotoFile && profilePhotoFile.size > 0) {
        uploadProfilePhoto(profilePhotoFile, username).then(photoURL => {
            if (photoURL) {
                accounts[username].photoURL = photoURL;
                console.log('Photo de profil uploadée:', photoURL);
            }
            saveAccountsToDatabase();
        });
    } else {
        saveAccountsToDatabase();
    }
    
    populateAthleteSelector();
    registerForm.reset();
    toggleAuthMode('login');
    loginError.textContent = `Compte créé. Connectez-vous avec ${username}.`;
}

function logout() {
    currentUser = null;
    userBanner.hidden = true;
    loginForm.reset();
    registerForm.reset();
    athleteNameInput.disabled = false;
    athleteSelector.disabled = false;
    openLoginScreen();
}

function normalizeSessions(data) {
    const sessionsSource = Array.isArray(data) ? data : (data.sessions || data.assignments || []);
    return sessionsSource.map(session => {
        const title = (session.title || session.day || 'Séance planifiée').toLowerCase();
        const description = (session.description || '').toLowerCase();
        const workout = (session.workout || '').toLowerCase();

        // Détection automatique du sport
        let sport = 'ppg'; // Par défaut PPG
        if (title.includes('natation') || description.includes('natation') || workout.includes('natation')) {
            sport = 'natation';
        } else if (title.includes('course') || title.includes('run') || description.includes('course') || description.includes('run') || workout.includes('course') || workout.includes('run')) {
            sport = 'course';
        } else if (title.includes('vélo') || title.includes('velo') || title.includes('bike') || description.includes('vélo') || description.includes('velo') || description.includes('bike') || workout.includes('vélo') || workout.includes('velo') || workout.includes('bike')) {
            sport = 'velo';
        } else if (title.includes('repos') || description.includes('repos') || workout.includes('repos')) {
            sport = 'repos';
        }

        return {
            day: session.day || '',
            title: session.title || session.day || 'Séance planifiée',
            duration: session.duration || session.length || '',
            intensity: session.intensity || '',
            workout: session.workout || '',
            description: session.description || '',
            sport: sport
        };
    });
}

function parseCsvText(text) {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim());
    if (!lines.length) {
        throw new Error('Le fichier CSV est vide.');
    }

    const headers = lines.shift().split(',').map(header => header.trim().toLowerCase());
    return lines.map(line => {
        const values = line.split(',').map(value => value.trim());
        return headers.reduce((row, key, index) => {
            row[key] = values[index] || '';
            return row;
        }, {});
    });
}

function getImportPayload(file, callback) {
    const reader = new FileReader();
    reader.onerror = () => callback(new Error('Impossible de lire le fichier.'));
    reader.onload = () => {
        try {
            let payload;
            if (file.name.toLowerCase().endsWith('.csv')) {
                const rows = parseCsvText(reader.result);
                payload = { sessions: rows, athlete: rows[0]?.athlete };
            } else {
                payload = JSON.parse(reader.result);
            }
            callback(null, payload);
        } catch (error) {
            callback(error);
        }
    };
    reader.readAsText(file);
}

function handleSessionImport(event) {
    event.preventDefault();
    const file = sessionFileInput.files[0];
    const athleteKey = athleteSelector.value?.trim().toLowerCase();

    if (!file) {
        alert('Veuillez sélectionner un fichier JSON ou CSV contenant les séances.');
        return;
    }

    getImportPayload(file, (error, data) => {
        if (error) {
            alert(`Erreur lors de l\'import : ${error.message}`);
            return;
        }

        const fileAthlete = data.athlete?.trim().toLowerCase();
        const targetAthlete = fileAthlete || athleteKey;
        const sessions = normalizeSessions(data);

        if (!targetAthlete || !sessions.length) {
            alert('Structure de fichier invalide. Vérifiez la clé athlete et les colonnes.')
            return;
        }

        assignedPrograms[targetAthlete] = sessions;
        saveAssignedPrograms();
        populateAthleteSelector();
        renderAssignedSessions(targetAthlete);
        renderAthleteAccounts();
        alert(`Séances déposées pour ${targetAthlete.charAt(0).toUpperCase() + targetAthlete.slice(1)}.`);
    });
}

function drawTrainingChart(animation = true) {
    if (!trainingCanvas) return;
    const ctx = trainingCanvas.getContext('2d');
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = trainingCanvas.clientWidth * devicePixelRatio;
    const height = trainingCanvas.clientHeight * devicePixelRatio;
    trainingCanvas.width = width;
    trainingCanvas.height = height;

    const padding = 60 * devicePixelRatio;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxLoad = Math.max(...weeklyLoad, 100) * 1.05;
    const barWidth = chartWidth / weeklyLoad.length * 0.55;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1 * devicePixelRatio;
    for (let index = 0; index <= 4; index += 1) {
        const y = padding + (chartHeight / 4) * index;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    ctx.font = `${14 * devicePixelRatio}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.textAlign = 'center';
    weekDays.forEach((label, index) => {
        const x = padding + ((chartWidth / weeklyLoad.length) * index) + (chartWidth / weeklyLoad.length) / 2;
        ctx.fillText(label, x, height - 18 * devicePixelRatio);
    });

    const startTime = performance.now();
    const duration = animation ? 800 : 0;

    function animate(now) {
        const progress = duration ? Math.min((now - startTime) / duration, 1) : 1;
        ctx.clearRect(padding, padding, chartWidth, chartHeight);

        weeklyLoad.forEach((value, index) => {
            const x = padding + (chartWidth / weeklyLoad.length) * index + ((chartWidth / weeklyLoad.length) - barWidth) / 2;
            const barHeight = (value / maxLoad) * chartHeight * progress;
            const y = padding + chartHeight - barHeight;

            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, '#3dd0ff');
            gradient.addColorStop(1, '#ff9f4c');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(`${value}h`, x + barWidth / 2, y - 12 * devicePixelRatio);
        });

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 2 * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(padding, padding + chartHeight);
        ctx.lineTo(width - padding, padding + chartHeight);
        ctx.stroke();

        if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

function drawProgressChart() {
    if (!progressCanvas) return;
    const ctx = progressCanvas.getContext('2d');
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = progressCanvas.clientWidth * devicePixelRatio;
    const height = progressCanvas.clientHeight * devicePixelRatio;
    progressCanvas.width = width;
    progressCanvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 0, width, height);

    const entries = getVisibleEntries().slice(0, 7).reverse();
    if (!entries.length) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = `${18 * devicePixelRatio}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Aucune donnée disponible', width / 2, height / 2);
        return;
    }

    const dates = entries.map(entry => entry.date);
    const speeds = entries.map(entry => entry.speed);
    const maxSpeed = Math.max(...speeds) * 1.15;
    const minSpeed = Math.min(...speeds) * 0.85;
    const leftPadding = 60 * devicePixelRatio;
    const bottomPadding = 50 * devicePixelRatio;
    const topPadding = 40 * devicePixelRatio;
    const chartWidth = width - leftPadding * 1.5;
    const chartHeight = height - topPadding - bottomPadding;

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1 * devicePixelRatio;
    for (let row = 0; row <= 4; row++) {
        const y = topPadding + (chartHeight / 4) * row;
        ctx.beginPath();
        ctx.moveTo(leftPadding, y);
        ctx.lineTo(width - 20 * devicePixelRatio, y);
        ctx.stroke();
    }

    ctx.font = `${12 * devicePixelRatio}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'center';
    dates.forEach((label, index) => {
        const x = leftPadding + (chartWidth / (dates.length - 1 || 1)) * index;
        ctx.fillText(label, x, height - 18 * devicePixelRatio);
    });

    ctx.beginPath();
    speeds.forEach((speed, index) => {
        const x = leftPadding + (chartWidth / (speeds.length - 1 || 1)) * index;
        const y = topPadding + chartHeight - ((speed - minSpeed) / Math.max(1, maxSpeed - minSpeed)) * chartHeight;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        ctx.fillStyle = '#3dd0ff';
        ctx.beginPath();
        ctx.arc(x, y, 5 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.strokeStyle = '#3dd0ff';
    ctx.lineWidth = 3 * devicePixelRatio;
    ctx.stroke();
}

function drawAthleteProgressChart() {
    if (!athleteProgressCanvas) return;
    const ctx = athleteProgressCanvas.getContext('2d');
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = athleteProgressCanvas.clientWidth * devicePixelRatio;
    const height = athleteProgressCanvas.clientHeight * devicePixelRatio;
    athleteProgressCanvas.width = width;
    athleteProgressCanvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(0, 0, width, height);

    const visibleEntries = getVisibleEntries();
    const topAthlete = visibleEntries.slice().sort((a, b) => b.speed - a.speed).slice(0, 4);
    if (!topAthlete.length) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = `${18 * devicePixelRatio}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Ajoutez des données pour visualiser la progression', width / 2, height / 2);
        return;
    }

    const columnWidth = (width - 80 * devicePixelRatio) / topAthlete.length;
    topAthlete.forEach((entry, index) => {
        const x = 40 * devicePixelRatio + columnWidth * index;
        const barHeight = Math.min(180 * devicePixelRatio, (entry.speed / 45) * 180 * devicePixelRatio);
        const y = height - 40 * devicePixelRatio - barHeight;
        ctx.fillStyle = index % 2 === 0 ? '#3dd0ff' : '#ff9f4c';
        ctx.fillRect(x, y, columnWidth * 0.7, barHeight);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.textAlign = 'center';
        ctx.font = `${12 * devicePixelRatio}px Inter, sans-serif`;
        ctx.fillText(entry.name, x + columnWidth * 0.35, height - 18 * devicePixelRatio);
        ctx.fillText(`${entry.speed} km/h`, x + columnWidth * 0.35, y - 10 * devicePixelRatio);
    });
}

function resetForm() {
    performanceForm.reset();
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!currentUser) {
        alert('Vous devez être connecté pour enregistrer une performance.');
        return;
    }
    
    const formData = new FormData(performanceForm);
    let name = formData.get('name').trim();
    const date = formData.get('date');
    const distance = parseFloat(formData.get('distance')) || 0;
    const duration = parseFloat(formData.get('duration')) || 0;
    const manualSpeed = parseFloat(formData.get('speed')) || 0;
    const water = parseFloat(formData.get('water')) || 0;
    const drink = parseFloat(formData.get('drink')) || 0;
    const food = (formData.get('food') || '').trim();
    const photo = formData.get('photo');

    if (currentUser && currentUser.role === 'athlete') {
        name = currentUser.displayName;
    }

    if (!name || !date || !distance || !duration) {
        alert('Veuillez remplir le nom, la date, la distance et la durée.');
        return;
    }

    let source = 'Saisie manuelle';
    let speed = getAverageSpeed(distance, duration, manualSpeed);
    if (photo && photo.name) {
        const guessed = parseStravaPhoto(photo);
        source = guessed.inferred === false ? 'Photo Strava' : 'Saisie photo';
        if (guessed.distance && guessed.duration) {
            speed = getAverageSpeed(guessed.distance, guessed.duration, guessed.speed);
        }
    }

    addPerformanceEntry({
        name,
        date,
        distance: distance.toFixed(1),
        duration: duration.toFixed(0),
        speed,
        water: water > 0 ? water.toFixed(1) : '',
        drink: drink > 0 ? drink.toFixed(0) : '',
        food,
        source
    });
    resetForm();
}

function initEvents() {
    dayButtons.forEach(button => {
        button.addEventListener('click', () => {
            updateSession(button.dataset.day);
        });
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => setActiveTab(button.dataset.tab));
    });

    refreshButton.addEventListener('click', () => drawTrainingChart(true));
    clearFormButton.addEventListener('click', resetForm);
    performanceForm.addEventListener('submit', handleFormSubmit);
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    authToggleButtons.forEach(button => {
        button.addEventListener('click', () => toggleAuthMode(button.dataset.auth));
    });
    logoutBtn.addEventListener('click', logout);
    sessionUploadForm.addEventListener('submit', handleSessionImport);
    athleteSelector.addEventListener('change', () => renderAssignedSessions(athleteSelector.value || currentUser?.username));

    window.addEventListener('resize', () => {
        drawTrainingChart(false);
        drawProgressChart();
        drawAthleteProgressChart();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initEvents();
    loadUserFromDatabase();
    updateSession('Lundi');
    drawTrainingChart(true);
    drawProgressChart();
    drawAthleteProgressChart();
});
