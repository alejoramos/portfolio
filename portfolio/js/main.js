const seeWorkBtn= document.getElementById('see-work-btn');
const skillsSection = document.getElementById('skills');
const projectsSection = document.getElementById('projects');

seeWorkBtn.addEventListener('click', () => {
    projectsSection.scrollIntoView({ behavior: 'smooth' });
});