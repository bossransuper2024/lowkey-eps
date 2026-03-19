// ===== REPORT SYSTEM WITH COOLDOWN =====



// ===== VOCAB DATA =====
let vocabData = {};
let currentCategory = "";
let currentIndex = 0;
let mode = 1; // 1=Flashcard, 2=Quiz, 3=Matching
const randomToggle = document.getElementById('randomToggle');

// Load vocab.json
fetch('./vocab.json?timestamp=' + new Date().getTime())
  .then(res => res.json())
  .then(data => { vocabData = data; })
  .catch(err => { console.log("Fallback: using default vocab", err); });

// ===== MODE SELECT =====
function setMode(selectedMode){
    mode = selectedMode;
    document.getElementById('modeMenu').classList.add('hidden');
    document.getElementById('categoryMenu').classList.remove('hidden');
    loadCategories();
}

// ===== CATEGORY MENU =====
function loadCategories(){
    const catDiv = document.getElementById('categories');
    const errorDiv = document.getElementById('errorMsg');
    catDiv.innerHTML = ""; errorDiv.innerText = "";

    if(!vocabData || Object.keys(vocabData).length === 0){
        errorDiv.innerText = "No categories found. Check vocab.json.";
        return;
    }

    for(let cat in vocabData){
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.innerText = cat;
        btn.onclick = () => selectCategory(cat);
        catDiv.appendChild(btn);
    }
}

function selectCategory(category){
    currentCategory = category;
    currentIndex = 0;
    document.getElementById('categoryMenu').classList.add('hidden');
    document.getElementById('flashcard').classList.remove('hidden');
    document.getElementById('categoryTitle').innerText = category;

    if(mode === 1) showWord(); // Flashcard
    else if(mode === 2) startQuiz(); // Quiz
    else if(mode === 3) startMatching(); // Matching
}

// ===== FLASHCARD MODE =====
function showWord(){
    const words = vocabData[currentCategory];
    if(!words || words.length === 0) return;

    const word = words[currentIndex];
    document.getElementById('hangul').innerText = word.hangul;
    document.getElementById('romanization').innerText = `(${word.romanization})`;
    document.getElementById('meaning').innerText = word.meaning;

    document.getElementById('romanization').classList.add('hidden');
    document.getElementById('meaning').classList.add('hidden');
    document.getElementById('tapInfo').style.display = 'none';

    if(mode === 1) document.getElementById('tapInfo').style.display = 'block';
    else if(mode === 2) revealFlashcard(); 
    else if(mode === 3){
        document.getElementById('meaning').classList.remove('hidden');
        document.getElementById('romanization').classList.add('hidden');
    }
}

function revealFlashcard(){
    document.getElementById('romanization').classList.remove('hidden');
    document.getElementById('meaning').classList.remove('hidden');
    document.getElementById('tapInfo').style.display = 'none';
}

function nextWord(){
    const words = vocabData[currentCategory];
    if(!words || words.length === 0) return;

    if(randomToggle.checked){
        let randIndex;
        do { randIndex = Math.floor(Math.random() * words.length); }
        while(words.length > 1 && randIndex === currentIndex);
        currentIndex = randIndex;
    } else {
        currentIndex = (currentIndex + 1) % words.length;
    }

    showWord();
}

document.getElementById('hangul').addEventListener('click', () => {
    if(mode === 1) revealFlashcard();
});

document.addEventListener("keydown", (e) => {
    if(e.key === "ArrowRight") nextWord();
    if(e.code === 'Space' && mode === 1){ e.preventDefault(); revealFlashcard(); }
});

// ===== QUIZ MODE =====
function startQuiz(){
    const words = vocabData[currentCategory];
    const quizDiv = document.getElementById('flashcard');
    quizDiv.innerHTML = ""; // clear flashcard area

    const half = Math.ceil(words.length / 2);
    const quizWords = words.slice(0, half);

    quizWords.forEach((w,i) => {
        const qDiv = document.createElement('div');
        qDiv.innerHTML = `<strong>Q${i+1}:</strong> ${w.hangul}`;
        qDiv.className = "quiz-question";
        const ansDiv = document.createElement('div');

        const options = shuffleArray([...words]); // shuffle options
        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.innerText = opt.meaning;
            btn.onclick = () => {
                btn.style.background = (opt.meaning === w.meaning) ? "green" : "red";
                // auto reveal correct
                ansDiv.innerHTML = `<small>Answer: ${w.meaning}</small>`;
                Array.from(ansDiv.previousElementSibling.children).forEach(b => b.disabled=true);
            };
            ansDiv.appendChild(btn);
        });
        quizDiv.appendChild(qDiv);
        quizDiv.appendChild(ansDiv);
        quizDiv.appendChild(document.createElement('hr'));
    });

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.innerText = "⬅️ Back";
    backBtn.onclick = backToMode;
    quizDiv.appendChild(backBtn);
}

// ===== MATCHING MODE =====
function startMatching(){
    const words = vocabData[currentCategory];
    const matchDiv = document.getElementById('flashcard');
    matchDiv.innerHTML = "";

    const sample = shuffleArray(words).slice(0,5);
    const hangulDiv = document.createElement('div');
    const meaningDiv = document.createElement('div');

    hangulDiv.style.marginBottom = "20px";
    meaningDiv.style.marginBottom = "20px";

    const shuffledMeanings = shuffleArray([...sample]);

    sample.forEach(w => {
        const btn = document.createElement('button');
        btn.innerText = w.hangul;
        btn.onclick = () => { btn.style.background = "#0ff"; }; // glow
        hangulDiv.appendChild(btn);
    });

    shuffledMeanings.forEach(w => {
        const btn = document.createElement('button');
        btn.innerText = w.meaning;
        btn.onclick = () => { btn.style.background = "#0ff"; }; // glow
        meaningDiv.appendChild(btn);
    });

    matchDiv.appendChild(hangulDiv);
    matchDiv.appendChild(meaningDiv);

    // Reveal button
    const revealBtn = document.createElement('button');
    revealBtn.className = 'back-btn';
    revealBtn.innerText = "Reveal Answer & Back";
    revealBtn.onclick = () => {
        sample.forEach((w,i)=>{
            hangulDiv.children[i].style.background="green";
            meaningDiv.children[i].style.background="green";
        });
        setTimeout(backToMode, 1000);
    };
    matchDiv.appendChild(revealBtn);
}

// ===== UTILS =====
function shuffleArray(arr){
    return arr.map(a=>[Math.random(),a]).sort((a,b)=>a[0]-b[0]).map(a=>a[1]);
}

// ===== BACK BUTTON =====
function backToMode(){
    document.getElementById('flashcard').classList.add('hidden');
    document.getElementById('categoryMenu').classList.add('hidden');
    document.getElementById('modeMenu').classList.remove('hidden');
}
