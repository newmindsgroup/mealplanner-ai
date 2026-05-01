<?php
// Step 3: Admin Account Setup

if (!isset($_SESSION['db_config'])) {
    header('Location: ?step=2');
    exit;
}

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['admin_name'] ?? '');
    $email = trim($_POST['admin_email'] ?? '');
    $password = $_POST['admin_password'] ?? '';
    $confirmPassword = $_POST['admin_password_confirm'] ?? '';

    if (empty($name) || empty($email) || empty($password)) {
        $error = 'All fields are required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Invalid email address.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long.';
    } elseif ($password !== $confirmPassword) {
        $error = 'Passwords do not match.';
    } else {
        // Hash password
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        // Store in session
        $_SESSION['admin_config'] = [
            'name' => $name,
            'email' => strtolower($email),
            'password_hash' => $passwordHash,
        ];

        // Redirect to next step
        header('Location: ?step=4');
        exit;
    }
}

$savedName = $_SESSION['admin_config']['name'] ?? '';
$savedEmail = $_SESSION['admin_config']['email'] ?? '';
?>

<div class="step-indicator">
    <div class="step completed">1. Requirements</div>
    <div class="step completed">2. Database</div>
    <div class="step active">3. Admin</div>
    <div class="step">4. Install</div>
    <div class="step">5. Complete</div>
</div>

<div class="card">
    <h2>Admin Account Setup</h2>
    <p>Create your administrator account:</p>

    <?php if ($error): ?>
        <div class="alert alert-error">
            <strong>Error:</strong> <?php echo htmlspecialchars($error); ?>
        </div>
    <?php endif; ?>

    <form method="POST" id="adminForm">
        <div class="form-group">
            <label for="admin_name">Full Name</label>
            <input type="text" 
                   id="admin_name" 
                   name="admin_name" 
                   value="<?php echo htmlspecialchars($savedName); ?>" 
                   placeholder="John Doe" 
                   required>
        </div>

        <div class="form-group">
            <label for="admin_email">Email Address</label>
            <input type="email" 
                   id="admin_email" 
                   name="admin_email" 
                   value="<?php echo htmlspecialchars($savedEmail); ?>" 
                   placeholder="admin@example.com" 
                   required>
        </div>

        <div class="form-group">
            <label for="admin_password">Password</label>
            <input type="password" 
                   id="admin_password" 
                   name="admin_password" 
                   placeholder="Minimum 6 characters" 
                   required>
            <div id="password-strength" class="password-strength"></div>
        </div>

        <div class="form-group">
            <label for="admin_password_confirm">Confirm Password</label>
            <input type="password" 
                   id="admin_password_confirm" 
                   name="admin_password_confirm" 
                   placeholder="Re-enter password" 
                   required>
        </div>

        <div class="button-group">
            <a href="?step=2" class="btn btn-secondary">← Back</a>
            <button type="submit" class="btn btn-primary">Next: Install →</button>
        </div>
    </form>
</div>

<script>
document.getElementById('admin_password').addEventListener('input', function(e) {
    const password = e.target.value;
    const strengthDiv = document.getElementById('password-strength');
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['#f44336', '#ff9800', '#ffc107', '#8bc34a', '#4caf50'];
    
    strengthDiv.textContent = 'Password Strength: ' + labels[Math.min(strength, 4)];
    strengthDiv.style.color = colors[Math.min(strength, 4)];
});
</script>

