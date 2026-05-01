<?php
// Step 4: Installation & Configuration

if (!isset($_SESSION['db_config']) || !isset($_SESSION['admin_config'])) {
    header('Location: ?step=2');
    exit;
}

$installing = isset($_POST['install']);
$log = [];
$success = false;

if ($installing) {
    set_time_limit(300); // 5 minutes

    // Generate JWT secret
    $jwtSecret = bin2hex(random_bytes(32));

    // Create .env file
    $envContent = "# Meal Plan Assistant Configuration\n\n";
    $envContent .= "NODE_ENV=production\n";
    $envContent .= "PORT=3001\n\n";
    $envContent .= "# Database\n";
    $envContent .= "DATABASE_HOST={$_SESSION['db_config']['host']}\n";
    $envContent .= "DATABASE_NAME={$_SESSION['db_config']['name']}\n";
    $envContent .= "DATABASE_USER={$_SESSION['db_config']['user']}\n";
    $envContent .= "DATABASE_PASSWORD={$_SESSION['db_config']['password']}\n\n";
    $envContent .= "# JWT\n";
    $envContent .= "JWT_SECRET=$jwtSecret\n";
    $envContent .= "JWT_EXPIRY=7d\n";
    $envContent .= "JWT_REFRESH_EXPIRY=30d\n\n";
    $envContent .= "# Frontend\n";
    $envContent .= "FRONTEND_URL=http://localhost:5173\n\n";
    $envContent .= "# Admin (temporary for migration)\n";
    $envContent .= "ADMIN_EMAIL={$_SESSION['admin_config']['email']}\n";
    $envContent .= "ADMIN_PASSWORD_HASH={$_SESSION['admin_config']['password_hash']}\n";
    $envContent .= "ADMIN_NAME={$_SESSION['admin_config']['name']}\n";

    $envPath = dirname(__DIR__, 2) . '/.env';
    if (file_put_contents($envPath, $envContent)) {
        $log[] = ['success', '✓ Configuration file created'];
    } else {
        $log[] = ['error', '✗ Failed to create .env file'];
    }

    // Change to server directory
    $serverDir = dirname(__DIR__, 2) . '/server';
    chdir($serverDir);

    // Install npm dependencies
    $log[] = ['info', 'Installing Node.js dependencies...'];
    exec('npm install --production 2>&1', $npmOutput, $npmReturn);
    if ($npmReturn === 0) {
        $log[] = ['success', '✓ Node.js dependencies installed'];
    } else {
        $log[] = ['error', '✗ Failed to install Node.js dependencies'];
        $log[] = ['error', implode("\n", array_slice($npmOutput, -5))];
    }

    // Run database migrations
    $log[] = ['info', 'Running database migrations...'];
    exec('node database/migrate.js 2>&1', $migrateOutput, $migrateReturn);
    if ($migrateReturn === 0) {
        $log[] = ['success', '✓ Database migrations completed'];
    } else {
        $log[] = ['error', '✗ Failed to run migrations'];
        $log[] = ['error', implode("\n", array_slice($migrateOutput, -5))];
    }

    // Create .installed file
    $installedPath = __DIR__ . '/../.installed';
    if (file_put_contents($installedPath, date('Y-m-d H:i:s'))) {
        $log[] = ['success', '✓ Installation lock file created'];
        $success = true;
    } else {
        $log[] = ['error', '✗ Failed to create installation lock file'];
    }

    // Clear sensitive session data
    unset($_SESSION['admin_config']['password_hash']);

    if ($success) {
        // Redirect to completion
        header('Location: ?step=5');
        exit;
    }
}
?>

<div class="step-indicator">
    <div class="step completed">1. Requirements</div>
    <div class="step completed">2. Database</div>
    <div class="step completed">3. Admin</div>
    <div class="step active">4. Install</div>
    <div class="step">5. Complete</div>
</div>

<div class="card">
    <h2>Installation</h2>

    <?php if (!$installing): ?>
        <p>Ready to install! The following will be performed:</p>
        <ul>
            <li>Create configuration file (.env)</li>
            <li>Install Node.js dependencies</li>
            <li>Create database tables</li>
            <li>Create your admin account</li>
        </ul>

        <div class="alert alert-info">
            <strong>Note:</strong> This process may take a few minutes. Please do not close this window.
        </div>

        <form method="POST">
            <input type="hidden" name="install" value="1">
            <div class="button-group">
                <a href="?step=3" class="btn btn-secondary">← Back</a>
                <button type="submit" class="btn btn-primary">Start Installation</button>
            </div>
        </form>
    <?php else: ?>
        <div class="installation-log">
            <?php foreach ($log as $entry): ?>
                <div class="log-entry log-<?php echo $entry[0]; ?>">
                    <?php echo htmlspecialchars($entry[1]); ?>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if (!$success): ?>
            <div class="alert alert-error">
                <strong>Installation Failed</strong>
                <p>Please check the log above for errors. You may need to manually fix the issues and try again.</p>
            </div>
            <div class="button-group">
                <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</div>

