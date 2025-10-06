const developerQuotes = [
    "Developer berpengalaman yang menciptakan aplikasi tracking anime keren. Menggabungkan teknologi dengan hiburan untuk pengalaman pengguna terbaik.",
    "Programmer handal yang passionate dalam dunia anime dan teknologi. Selalu berinovasi untuk memberikan solusi digital terbaik.",
    "Full Stack Developer yang mengubah passion anime menjadi aplikasi web yang menakjubkan. Dedikasi tinggi dalam setiap baris kode.",
    "Kreator aplikasi anime dengan pengalaman luas dalam web development. Fokus pada performa dan user experience yang optimal.",
    "Developer enthusiast yang menggabungkan keahlian coding dengan kecintaan pada anime. Menghadirkan platform tracking yang modern dan efisien.",
    "Ahli teknologi web yang bersemangat mengembangkan aplikasi anime tracking. Komitmen penuh untuk kualitas dan inovasi.",
    "Programmer kreatif yang membangun jembatan antara teknologi dan entertainment. Spesialis dalam menciptakan pengalaman digital yang memorable.",
    "Full Stack Developer dengan visi menghadirkan anime tracking terbaik. Expertise dalam JavaScript, Node.js, dan modern web technologies.",
    "Developer berdedikasi yang selalu update dengan teknologi terkini. Passion dalam anime dan coding menghasilkan karya terbaik.",
    "Kreator digital yang passionate membangun solusi tracking anime inovatif. Mengedepankan clean code dan user-friendly interface.",
    "Programmer anime enthusiast dengan skill mendalam di web development. Selalu berusaha memberikan fitur-fitur terbaik untuk komunitas.",
    "Developer yang menghadirkan anime tracking dengan teknologi modern. Kombinasi sempurna antara keahlian teknis dan kreativitas.",
    "Ahli web development yang mencintai anime dan teknologi. Berkomitmen menghadirkan platform tracking berkualitas tinggi.",
    "Full Stack Developer yang mengubah ide menjadi kenyataan digital. Fokus pada inovasi dan kepuasan pengguna.",
    "Kreator aplikasi web yang passionate dalam dunia anime. Expertise dalam menciptakan solusi tracking yang powerful dan elegan."
];

let currentQuoteIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 50;
let deletingSpeed = 30;
let pauseAfterComplete = 3000;
let pauseBeforeDelete = 17000;

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * developerQuotes.length);
    return developerQuotes[randomIndex];
}

function typeWriter() {
    const quoteElement = document.querySelector('.profile-description p');
    if (!quoteElement) return;

    const currentQuote = developerQuotes[currentQuoteIndex];
    
    if (isDeleting) {
        quoteElement.textContent = currentQuote.substring(0, charIndex - 1);
        charIndex--;
        
        if (charIndex === 0) {
            isDeleting = false;
            currentQuoteIndex = (currentQuoteIndex + 1) % developerQuotes.length;
            setTimeout(typeWriter, 500);
            return;
        }
        
        setTimeout(typeWriter, deletingSpeed);
    } else {
        quoteElement.textContent = currentQuote.substring(0, charIndex + 1);
        charIndex++;
        
        if (charIndex === currentQuote.length) {
            setTimeout(() => {
                isDeleting = true;
                typeWriter();
            }, pauseBeforeDelete);
            return;
        }
        
        setTimeout(typeWriter, typingSpeed);
    }
}

function displayRandomQuote() {
    const quoteElement = document.querySelector('.profile-description p');
    if (quoteElement) {
        currentQuoteIndex = Math.floor(Math.random() * developerQuotes.length);
        charIndex = 0;
        isDeleting = false;
        quoteElement.textContent = '';
        
        setTimeout(() => {
            typeWriter();
        }, 500);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayRandomQuote);
} else {
    displayRandomQuote();
}
