// learning.js - interactive ASL learning module

const learningModal = document.getElementById('learningModal');
const learnButton = document.getElementById('learnButton');
const closeModal = document.querySelector('#learningModal .close');
const gestureGrid = document.getElementById('gestureGrid');

const detailModal = document.getElementById('gestureDetailModal');
const closeDetail = document.querySelector('#gestureDetailModal .close-detail');
const gestureImage = document.getElementById('gestureImage');
const gestureLetterEl = document.getElementById('gestureLetter');
const gestureTitle = document.getElementById('gestureTitle');
const gestureDescription = document.getElementById('gestureDescription');
const gestureTips = document.getElementById('gestureTips');

// Simple placeholder descriptions
const gestureData = {
"A": { image: "assets/A.png", description: "How to sign A in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"B": { image: "assets/B.png", description: "How to sign B in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"C": { image: "assets/C.png", description: "How to sign C in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"D": { image: "assets/D.png", description: "How to sign D in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"E": { image: "assets/E.png", description: "How to sign E in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"F": { image: "assets/F.png", description: "How to sign F in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"G": { image: "assets/G.png", description: "How to sign G in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"H": { image: "assets/H.png", description: "How to sign H in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"I": { image: "assets/I.png", description: "How to sign I in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"J": { image: "assets/J.png", description: "How to sign J in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"K": { image: "assets/K.png", description: "How to sign K in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"L": { image: "assets/L.png", description: "How to sign L in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"M": { image: "assets/M.png", description: "How to sign M in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"N": { image: "assets/N.png", description: "How to sign N in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"O": { image: "assets/O.png", description: "How to sign O in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"P": { image: "assets/P.png", description: "How to sign P in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"Q": { image: "assets/Q.png", description: "How to sign Q in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"R": { image: "assets/R.png", description: "How to sign R in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"S": { image: "assets/S.png", description: "How to sign S in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"T": { image: "assets/T.png", description: "How to sign T in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"U": { image: "assets/U.png", description: "How to sign U in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"V": { image: "assets/V.png", description: "How to sign V in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"W": { image: "assets/W.png", description: "How to sign W in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"X": { image: "assets/X.png", description: "How to sign X in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"Y": { image: "assets/Y.png", description: "How to sign Y in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
"Z": { image: "assets/Z.png", description: "How to sign Z in ASL.", tips: ["Keep your hand steady", "Practice in front of a mirror"] },
};


// Populate gesture grid
Object.keys(gestureData).forEach(letter => {
    const item = document.createElement('div');
    item.className = 'grid-item';
    const img = document.createElement('img');
    img.src = gestureData[letter].image;
    img.alt = letter;
    const caption = document.createElement('div');
    caption.textContent = letter;
    item.appendChild(img);
    item.appendChild(caption);
    item.addEventListener('click', () => showGestureDetail(letter));
    gestureGrid.appendChild(item);
});

function showGestureDetail(letter) {
    const data = gestureData[letter];
    gestureImage.src = data.image;
    gestureLetterEl.textContent = letter;
    gestureTitle.textContent = `Gesture: ${letter}`;
    gestureDescription.textContent = data.description;
    gestureTips.innerHTML = '';
    data.tips.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        gestureTips.appendChild(li);
    });
    detailModal.style.display = 'block';
}

// Modal controls
learnButton.addEventListener('click', () => {
    learningModal.style.display = 'block';
});
closeModal.addEventListener('click', () => {
    learningModal.style.display = 'none';
});
closeDetail.addEventListener('click', () => {
    detailModal.style.display = 'none';
});
window.addEventListener('click', (event) => {
    if (event.target === learningModal) learningModal.style.display = 'none';
    if (event.target === detailModal) detailModal.style.display = 'none';
});
