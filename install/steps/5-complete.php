<?php
// Step 5: Installation Complete

if (!file_exists(__DIR__ . '/../.installed')) {
    header('Location: ?step=4');
    exit;
}
?>

<div class="step-indicator">
    <div class="step completed">1. Requirements</div>
    <div class="step completed">2. Database</div>
    <div class="step completed">3. Admin</div>
    <div class="step completed">4. Install</div>
    <div class="step completed">5. Complete</div>
</div>

<div class="card">
    <div class="success-message">
        <div class="success-icon">🎉</div>
        <h2>Installation Complete!</h2>
        <p>Your Meal Plan Assistant is now ready to use.</p>
    </div>

    <div class="alert alert-success">
        <strong>Next Steps:</strong>
        <ol style="margin: 10px 0 0 20px; text-align: left;">
            <li>Start the Node.js server: <code>cd server && node index.js</code></li>
            <li>For production, use PM2: <code>pm2 start server/index.js --name mealplan-assistant</code></li>
            <li>Configure your web server to proxy requests to the Node.js server</li>
            <li>Set up SSL certificate for secure HTTPS access</li>
        </ol>
    </div>

    <div class="alert alert-info">
        <strong>Admin Credentials:</strong>
        <p>Email: <code><?php echo htmlspecialchars($_SESSION['admin_config']['email'] ?? 'N/A'); ?></code></p>
        <p>Use the password you set during installation to login.</p>
    </div>

    <div class="alert alert-warning">
        <strong>Security Reminder:</strong>
        <p>For security reasons, please delete or rename the <code>install</code> directory after installation.</p>
    </div>

    <div class="button-group">
        <a href="/" class="btn btn-primary btn-large">Launch Application →</a>
    </div>
</div>

<script>
// Confetti effect
setTimeout(() => {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}, 500);
</script>

