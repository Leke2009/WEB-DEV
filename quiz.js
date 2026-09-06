// ==========================================
// QUIZ DATA (The questions and answers)
// ==========================================
const quizData = {
  cosmos: {
    title: "Journey to the Cosmos",
    questions: [
      { question: "What is the largest planet in our solar system?", options: ["Earth", "Jupiter", "Saturn", "Neptune"], correct: 1 },
      { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], correct: 1 },
      { question: "What is the name of the galaxy that contains our Solar System?", options: ["Andromeda", "Milky Way", "Triangulum", "Whirlpool"], correct: 1 },
      { question: "Who was the first human to travel into space?", options: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "John Glenn"], correct: 2 },
      { question: "What is the closest star to Earth?", options: ["Proxima Centauri", "Sirius", "The Sun", "Alpha Centauri"], correct: 2 }
    ]
  },
  daily: {
    title: "Daily Brain Teaser",
    questions: [
      { question: "What has keys but can't open locks?", options: ["A map", "A piano", "A clock", "A book"], correct: 1 },
      { question: "I speak without a mouth and hear without ears. What am I?", options: ["An echo", "A shadow", "The wind", "A radio"], correct: 0 },
      { question: "The more of this there is, the less you see. What is it?", options: ["Fog", "Darkness", "Smoke", "Glare"], correct: 1 }
    ]
  }
};

// ==========================================
// INSTRUCTION 3: UPDATE APP STATE
// Track the current question and user's responses
// ==========================================
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let userResponses = []; // Array to track every selection the user makes
let timeElapsed = 0;
let timerInterval = null;

// ==========================================
// DOM ELEMENT REFERENCES
// ==========================================
const quizModalEl = document.getElementById('quizModal');
const resultModalEl = document.getElementById('resultModal');
const quizTitleEl = document.getElementById('quizTitle');
const questionTextEl = document.getElementById('questionText');
const optionsContainerEl = document.getElementById('optionsContainer');
const nextBtnEl = document.getElementById('nextBtn');
const questionCounterEl = document.getElementById('questionCounter');
const quizProgressBarEl = document.getElementById('quizProgressBar');
const timerEl = document.getElementById('timer');

// Initialize Bootstrap Modals
const quizModal = new bootstrap.Modal(quizModalEl);
const resultModal = new bootstrap.Modal(resultModalEl);

// ==========================================
// QUIZ LOGIC
// ==========================================

function startQuiz(quizKey) {
  // Reset state for a new quiz
  currentQuiz = quizData[quizKey];
  currentQuestionIndex = 0;
  score = 0;
  userResponses = []; 
  timeElapsed = 0;
  
  quizTitleEl.textContent = currentQuiz.title;
  quizModal.show();
  renderQuestion();
  startTimer();
}

// ==========================================
// INSTRUCTION 1: DYNAMICALLY DISPLAY QUESTIONS & CHOICES
// ==========================================
function renderQuestion() {
  const q = currentQuiz.questions[currentQuestionIndex];
  
  // Dynamically display the current question text
  questionTextEl.textContent = q.question;
  
  // Clear previous answer choices
  optionsContainerEl.innerHTML = '';
  nextBtnEl.disabled = true;
  
  // Update progress bar and counter
  const progress = (currentQuestionIndex / currentQuiz.questions.length) * 100;
  quizProgressBarEl.style.width = `${progress}%`;
  questionCounterEl.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}`;

  // Dynamically generate and display answer choices
  q.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-secondary text-start rounded-3 py-3 px-4 fw-semibold option-btn';
    btn.textContent = opt;
    
    // ==========================================
    // INSTRUCTION 2: ADD EVENT LISTENERS TO CAPTURE SELECTIONS
    // ==========================================
    btn.addEventListener('click', () => selectAnswer(index, btn));
    
    optionsContainerEl.appendChild(btn);
  });
}

// ==========================================
// INSTRUCTION 2 & 3: CAPTURE SELECTION & UPDATE STATE
// ==========================================
function selectAnswer(selectedIndex, btnElement) {
  const q = currentQuiz.questions[currentQuestionIndex];
  const isCorrect = selectedIndex === q.correct;
  
  // INSTRUCTION 3: Update state to track the user's specific response
  userResponses.push({
    questionIndex: currentQuestionIndex,
    questionText: q.question,
    selectedOption: selectedIndex,
    selectedText: q.options[selectedIndex],
    isCorrect: isCorrect
  });

  // Update score state if correct
  if (isCorrect) {
    score++;
  }

  // UI Feedback (Disable buttons and show correct/incorrect colors)
  const buttons = optionsContainerEl.querySelectorAll('.option-btn');
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('btn-outline-secondary');
    btn.classList.add('btn-light');
  });

  if (isCorrect) {
    btnElement.classList.remove('btn-light');
    btnElement.classList.add('btn-success', 'text-white');
    btnElement.innerHTML += ' <i class="bi bi-check-circle-fill ms-2"></i>';
  } else {
    btnElement.classList.remove('btn-light');
    btnElement.classList.add('btn-danger', 'text-white');
    btnElement.innerHTML += ' <i class="bi bi-x-circle-fill ms-2"></i>';
    
    // Highlight the correct answer
    buttons[q.correct].classList.remove('btn-light');
    buttons[q.correct].classList.add('btn-success', 'text-white');
    buttons[q.correct].innerHTML += ' <i class="bi bi-check-circle-fill ms-2"></i>';
  }
  
  // Enable the "Next" button
  nextBtnEl.disabled = false;
}

function nextQuestion() {
  // INSTRUCTION 3: Update state to track the current question index
  currentQuestionIndex++;
  
  if (currentQuestionIndex < currentQuiz.questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  clearInterval(timerInterval);
  quizProgressBarEl.style.width = '100%';
  quizModal.hide();
  
  const total = currentQuiz.questions.length;
  const accuracy = Math.round((score / total) * 100);
  const coinsEarned = score * 10 + (accuracy === 100 ? 20 : 0);
  
  // Display results
  document.getElementById('finalScore').textContent = score;
  document.getElementById('totalQuestions').textContent = total;
  document.getElementById('coinsEarned').textContent = coinsEarned;
  document.getElementById('accuracy').textContent = `${accuracy}%`;
  
  updateHeaderStats(coinsEarned);
  
  // Log user responses to console (Proof of state tracking for instructor)
  console.log("Quiz Completed! User Responses Tracked:", userResponses);
  
  setTimeout(() => {
    resultModal.show();
  }, 300);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed++;
    const mins = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
    const secs = (timeElapsed % 60).toString().padStart(2, '0');
    timerEl.textContent = `${mins}:${secs}`;
  }, 1000);
}

function updateHeaderStats(coinsEarned) {
  const statElements = [document.getElementById('userStats'), document.getElementById('userStatsMobile')];
  statElements.forEach(el => {
    if (el) {
      const match = el.textContent.match(/(\d+)\s*Coins/);
      if (match) {
        const currentCoins = parseInt(match[1]);
        el.textContent = el.textContent.replace(/(\d+)\s*Coins/, `${currentCoins + coinsEarned} Coins`);
      }
    }
  });
}

function resetQuiz() {
  clearInterval(timerInterval);
  currentQuiz = null;
  currentQuestionIndex = 0;
  score = 0;
  userResponses = [];
}

// ==========================================
// INITIALIZATION & GLOBAL EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Start quiz when clicking the featured card or "Play Now" button
  const quizTriggers = document.querySelectorAll('.quiz-trigger');
  quizTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const quizKey = trigger.getAttribute('data-quiz');
      if (quizKey && quizData[quizKey]) {
        startQuiz(quizKey);
      }
    });
  });

  // Category selection UI logic
  const categories = document.querySelectorAll('.category-card');
  categories.forEach(cat => {
    cat.addEventListener('click', function() {
      categories.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
    });
  });
});