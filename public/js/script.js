function togglePassword() {
    const passwordInput = document.getElementById('account_password');
    const toggleBtn = document.getElementById('toggleBtn');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'show';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'hide';
    }
}


// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function () {
    const hamburgerBtn = document.getElementById('hamburger');
    const navUl = document.querySelector('nav ul');

    if (hamburgerBtn && navUl) {
        hamburgerBtn.addEventListener('click', function () {
            navUl.classList.toggle('show');
            hamburgerBtn.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (event) {
            const isClickInsideNav = navUl.contains(event.target);
            const isClickInsideHamburger = hamburgerBtn.contains(event.target);

            if (!isClickInsideNav && !isClickInsideHamburger && navUl.classList.contains('show')) {
                navUl.classList.remove('show');
                hamburgerBtn.classList.remove('active');
            }
        });

        // Close menu when clicking on a link
        const navLinks = navUl.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                navUl.classList.remove('show');
                hamburgerBtn.classList.remove('active');
            });
        });
    }
});