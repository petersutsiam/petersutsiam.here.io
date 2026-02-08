onload = () =>{
    document.body.classList.remove("container");
};

const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");
const card = document.querySelector(".card");


function moveNoButton() {
    const cardRect = card.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const maxX = Math.max(0, cardRect.width - btnRect.width - 10);
    const maxY = Math.max(0, cardRect.height - btnRect.height - 10);

    const minDistance = Math.max(btnRect.width, btnRect.height);

    // current position relative to the card
    const currentX = btnRect.left - cardRect.left;
    const currentY = btnRect.top - cardRect.top;

    let newX, newY;

    // Try a few random positions until one is at least minDistance away
    const maxAttempts = 20;
    let attempt = 0;
    for (; attempt < maxAttempts; attempt++) {
        newX = Math.random() * maxX;
        newY = Math.random() * maxY;
        const dx = newX - currentX;
        const dy = newY - currentY;
        if (Math.hypot(dx, dy) >= minDistance) break;
    }

    // If we didn't find a sufficiently distant random spot, force a jump outward
    if (attempt === maxAttempts) {
        // pick a random angle and move exactly minDistance in that direction
        const angle = Math.random() * Math.PI * 2;
        newX = currentX + Math.cos(angle) * minDistance;
        newY = currentY + Math.sin(angle) * minDistance;
        // clamp into card bounds
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
    }

    noBtn.style.left = Math.round(newX) + "px";
    noBtn.style.top = Math.round(newY) + "px";
}

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("pointerenter", moveNoButton);
noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    moveNoButton();
}, { passive: false });

yesBtn.addEventListener("click", () => {
    confetti({
    particleCount: 260,
    spread: 120,
    origin: { y: 0.65 }
    });

    setTimeout(() => {
    alert("YAY 💕 I can’t wait for Valentine’s Day with you!");
    }, 500);
});

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
