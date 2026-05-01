// Meal Plan Assistant Installer JavaScript

// Smooth scroll to top on page load
window.addEventListener('load', function() {
    window.scrollTo(0, 0);
});

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Password strength indicator
function updatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['#f44336', '#ff9800', '#ffc107', '#8bc34a', '#4caf50'];

    return {
        label: labels[Math.min(strength, 4)],
        color: colors[Math.min(strength, 4)]
    };
}

// Prevent double submission
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Please wait...';
            }
        });
    });
});

// Auto-scroll installation log
const installLog = document.querySelector('.installation-log');
if (installLog) {
    const observer = new MutationObserver(function() {
        installLog.scrollTop = installLog.scrollHeight;
    });
    observer.observe(installLog, { childList: true, subtree: true });
}

