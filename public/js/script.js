const eyeIcon = document.getElementById("eye");

function togglePassword() {
    const pswd = document.getElementById("account_password");
    if (pswd.type === "password") {
        pswd.type = "text";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    } else {
        pswd.type = "password";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    }
}