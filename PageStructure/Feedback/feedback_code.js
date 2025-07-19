// Form URLs - Replace these with your actual Google Form URLs
const formUrls = {
    'bug-report': 'https://forms.google.com/your-bug-report-form',
    'general-feedback': 'https://forms.google.com/your-general-feedback-form',
    'feature-request': 'https://forms.google.com/your-feature-request-form',
    'balance-feedback': 'https://forms.google.com/your-balance-feedback-form',
    'audio-visual': 'https://forms.google.com/your-audio-visual-form',
    'community-ideas': 'https://forms.google.com/your-community-ideas-form'
};

function openForm(formType) {
    const url = formUrls[formType];
    if (url && url !== 'https://forms.google.com/your-' + formType + '-form') {
        window.open(url, '_blank');
    } else {
        alert('Form URL not configured yet. Please replace the placeholder URLs in the JavaScript with your actual Google Form URLs.');
    }
}

// Create floating particles
function createParticles() {
    const colors = ['#663399', '#00ffff', '#ff0066'];

    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = '0s';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';

        document.body.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 20000);
    }, 500);
}

// Glitch effect for cards
function addGlitchEffect() {
    const cards = document.querySelectorAll('.form-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (Math.random() > 0.7) {
                card.style.filter = 'hue-rotate(180deg)';
                setTimeout(() => {
                    card.style.filter = 'none';
                }, 200);
            }
        });
    });
}

// Initialize effects
window.addEventListener('load', () => {
    createParticles();
    addGlitchEffect();
});

// Scanner effect on page load
function scanEffect() {
    const scanner = document.createElement('div');
    scanner.style.position = 'fixed';
    scanner.style.top = '0';
    scanner.style.left = '0';
    scanner.style.width = '100%';
    scanner.style.height = '3px';
    scanner.style.background = 'linear-gradient(90deg, transparent, #00ffff, transparent)';
    scanner.style.zIndex = '1000';
    scanner.style.animation = 'scanDown 2s ease-out';

    const style = document.createElement('style');
    style.textContent = `
                @keyframes scanDown {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
            `;
    document.head.appendChild(style);
    document.body.appendChild(scanner);

    setTimeout(() => {
        if (scanner.parentNode) {
            scanner.parentNode.removeChild(scanner);
        }
    }, 2000);
}

// Run scan effect on load
window.addEventListener('load', () => {
    setTimeout(scanEffect, 500);
});