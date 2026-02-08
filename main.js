onload = () =>{
    document.body.classList.remove("container");
};

const card1 = document.getElementById("card-1");
const card2 = document.getElementById("card-2");
const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");
const yes2 = document.getElementById("yes2");
const no2 = document.getElementById("no2");

const audio = document.getElementById("bgAudio");

document.addEventListener("click", () => {
    audio.volume = 0.5;
    audio.play();
}, { once: true });

let currentCard = 1; // Track which card is visible

function moveNoButton(targetBtn = noBtn) {
    const cardRect = card2.getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();

    const maxX = Math.max(0, cardRect.width - btnRect.width - 10);
    const maxY = Math.max(0, cardRect.height - btnRect.height - 10);

    // base minimum distance (at least button size)
    let minDistance = Math.max(btnRect.width, btnRect.height);
    // If this is the second-card 'no2' button, make jumps significantly larger and more random
    const isNo2 = targetBtn && targetBtn.id === 'no2';
    if (isNo2) {
        // scale up required distance and allow extra randomness
        const scale = 2 + Math.random() * 2; // between 2x and 4x
        minDistance = Math.max(minDistance * scale, Math.min(cardRect.width, cardRect.height) * 0.25);
    }

    // current position relative to the card
    const currentX = btnRect.left - cardRect.left;
    const currentY = btnRect.top - cardRect.top;

    let newX, newY;

    // Try a few random positions until one is at least minDistance away
    const maxAttempts = isNo2 ? 80 : 20;
    let attempt = 0;
    const padding = 10; // minimum gap from yes2
    for (; attempt < maxAttempts; attempt++) {
        newX = Math.random() * maxX;
        newY = Math.random() * maxY;
        const dx = newX - currentX;
        const dy = newY - currentY;
        if (Math.hypot(dx, dy) < minDistance) continue;

        // If this is no2, ensure it doesn't overlap yes2 (keep padding)
        if (isNo2 && yes2) {
            const yesRect = yes2.getBoundingClientRect();
            const yesX = yesRect.left - cardRect.left;
            const yesY = yesRect.top - cardRect.top;
            // check rect overlap with padding
            const overlapX = !(newX + btnRect.width + padding <= yesX || newX >= yesX + yesRect.width + padding);
            const overlapY = !(newY + btnRect.height + padding <= yesY || newY >= yesY + yesRect.height + padding);
            if (overlapX && overlapY) continue; // reject this candidate
        }

        break;
    }

    // If we didn't find a sufficiently distant random spot, force a jump outward
    if (attempt === maxAttempts) {
        // Force a position that keeps padding from yes2 when possible
        if (isNo2 && yes2) {
            const yesRect = yes2.getBoundingClientRect();
            const yesX = yesRect.left - cardRect.left + yesRect.width / 2;
            const yesY = yesRect.top - cardRect.top + yesRect.height / 2;
            const btnHalfW = btnRect.width / 2;
            const btnHalfH = btnRect.height / 2;
            const reqDist = Math.hypot(btnHalfW + yesRect.width / 2 + padding, btnHalfH + yesRect.height / 2 + padding);
            const angle = Math.random() * Math.PI * 2;
            const forcedDist = Math.max(reqDist, minDistance);
            const centerX = yesX + Math.cos(angle) * forcedDist;
            const centerY = yesY + Math.sin(angle) * forcedDist;
            newX = centerX - btnHalfW;
            newY = centerY - btnHalfH;
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
        } else {
            const angle = Math.random() * Math.PI * 2;
            const forcedDist = minDistance * (isNo2 ? (1 + Math.random() * 2) : 1);
            newX = currentX + Math.cos(angle) * forcedDist;
            newY = currentY + Math.sin(angle) * forcedDist;
            // clamp into card bounds
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
        }
    }

    // If it's no2, occasionally bias to edges for more dramatic jumps
    if (isNo2) {
        if (Math.random() < 0.5) {
            // push further toward an edge
            newX = newX < maxX / 2 ? Math.max(0, newX - Math.random() * (maxX * 0.4)) : Math.min(maxX, newX + Math.random() * (maxX * 0.4));
            newY = newY < maxY / 2 ? Math.max(0, newY - Math.random() * (maxY * 0.4)) : Math.min(maxY, newY + Math.random() * (maxY * 0.4));
        }
    }

    targetBtn.style.left = Math.round(newX) + "px";
    targetBtn.style.top = Math.round(newY) + "px";
}

function switchToCard2() {
    card1.style.display = "none";
    card2.style.display = "block";
    currentCard = 2;
    // Reset button positions for card 2
    if (no2) {
        no2.style.left = "55%";
        no2.style.top = "0";
    } else {
        noBtn.style.left = "55%";
        noBtn.style.top = "0";
    }
}

function showImposter() {
    // Shake animation on card 1
    card1.classList.add("imposter");
    setTimeout(() => {
        card1.classList.remove("imposter");
    }, 500);
}

// Card 1 handlers
yesBtn.addEventListener("click", (e) => {
    if (currentCard === 1) {
        e.stopImmediatePropagation();
        switchToCard2();
        setupCard2Handlers();
    }
});

noBtn.addEventListener("click", () => {
    if (currentCard === 1) {
        showImposter();
    }
});

function setupCard2Handlers() {
    // Remove old listeners and add new ones
    // wire the card-2 visible 'no' button to move away behavior
    const btns = [noBtn, no2];
    btns.forEach(btn => {
        if (!btn) return;
        // remove any previous bound handlers
        if (btn._moveHandler) {
            btn.removeEventListener('mouseenter', btn._moveHandler);
            btn.removeEventListener('pointerenter', btn._moveHandler);
            btn.removeEventListener('touchstart', btn._touchHandler);
        }
        const moveHandler = (e) => moveNoButton(e.currentTarget || btn);
        const touchHandler = (e) => { e.preventDefault(); moveNoButton(e.currentTarget || btn); };
        btn._moveHandler = moveHandler;
        btn._touchHandler = touchHandler;
        btn.addEventListener('mouseenter', moveHandler);
        btn.addEventListener('pointerenter', moveHandler);
        btn.addEventListener('touchstart', touchHandler, { passive: false });
    });
}

function handleNoTouch(e) {
    if (currentCard === 2) {
        e.preventDefault();
        moveNoButton(e.currentTarget || no2);
    }
}

function handleNoMoveEvents() {
    if (currentCard !== 2) return;
    moveNoButton();
}

// Card 2 yes button handler (in addition to card 1)
const originalYesHandler = (e) => {
    if (currentCard === 2) {
        confetti({
            particleCount: 260,
            spread: 120,
            origin: { y: 0.65 }
        });

        setTimeout(() => {
            alert("YAY 💕 I can't wait for Valentine's Day with you!");
        }, 500);
    }
};

yesBtn.addEventListener("click", originalYesHandler);
// wire second-card buttons so they behave correctly
if (yes2) {
    yes2.addEventListener('click', (e) => {
        if (currentCard === 1) {
            showImposter();
        } else if (currentCard === 2) {
            originalYesHandler(e);
        }
    });
}

if (no2) {
    no2.addEventListener('click', (e) => {
        if (currentCard === 1) {
            switchToCard2();
            setupCard2Handlers();
        } else if (currentCard === 2) {
            // card2 no -> move away
            moveNoButton(no2);
        }
    });
}

function createHeart() {
      const heart = document.createElement("div");
      heart.className = "heart";
      heart.innerHTML = Math.random() > 0.5 ? "❤️" : "💗";
      heart.style.left = Math.random() * 100 + "vw";
      heart.style.fontSize = Math.random() * 22 + 14 + "px";
      heart.style.animationDuration = Math.random() * 3 + 4 + "s";
      heart.style.opacity = Math.random() * 0.5 + 0.4;

      document.body.append(heart);
      setTimeout(() => heart.remove(), 8000);
    }

    setInterval(createHeart, 750);
