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

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * developerQuotes.length);
    return developerQuotes[randomIndex];
}

function displayRandomQuote() {
    const quoteElement = document.querySelector('.profile-description p');
    if (quoteElement) {
        quoteElement.textContent = getRandomQuote();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayRandomQuote);
} else {
    displayRandomQuote();
}
