<?php
// Step 1: Requirements Check

$requirements = [
    'PHP Version >= 7.4' => version_compare(PHP_VERSION, '7.4.0', '>='),
    'MySQL Extension' => extension_loaded('mysqli'),
    'JSON Extension' => extension_loaded('json'),
    'cURL Extension' => extension_loaded('curl'),
    'File Permissions (.env writable)' => is_writable(dirname(__DIR__, 2)) || !file_exists(dirname(__DIR__, 2) . '/.env'),
];

$allPass = !in_array(false, $requirements, true);

// Check for Node.js (optional but recommended)
$nodeVersion = null;
exec('node --version 2>&1', $nodeOutput, $nodeReturn);
if ($nodeReturn === 0 && !empty($nodeOutput[0])) {
    $nodeVersion = trim($nodeOutput[0]);
}

$npmVersion = null;
exec('npm --version 2>&1', $npmOutput, $npmReturn);
if ($npmReturn === 0 && !empty($npmOutput[0])) {
    $npmVersion = trim($npmOutput[0]);
}
?>

<div class="step-indicator">
    <div class="step active">1. Requirements</div>
    <div class="step">2. Database</div>
    <div class="step">3. Admin</div>
    <div class="step">4. Install</div>
    <div class="step">5. Complete</div>
</div>

<div class="card">
    <h2>System Requirements</h2>
    <p>Checking your server configuration...</p>

    <div class="requirements-list">
        <?php foreach ($requirements as $name => $status): ?>
            <div class="requirement-item <?php echo $status ? 'pass' : 'fail'; ?>">
                <span class="icon"><?php echo $status ? '✓' : '✗'; ?></span>
                <span class="name"><?php echo htmlspecialchars($name); ?></span>
                <span class="status"><?php echo $status ? 'Pass' : 'Fail'; ?></span>
            </div>
        <?php endforeach; ?>
    </div>

    <h3>Node.js &amp; NPM (Backend Server)</h3>
    <div class="requirements-list">
        <div class="requirement-item <?php echo $nodeVersion ? 'pass' : 'warn'; ?>">
            <span class="icon"><?php echo $nodeVersion ? '✓' : '⚠'; ?></span>
            <span class="name">Node.js</span>
            <span class="status"><?php echo $nodeVersion ? $nodeVersion : 'Not Found'; ?></span>
        </div>
        <div class="requirement-item <?php echo $npmVersion ? 'pass' : 'warn'; ?>">
            <span class="icon"><?php echo $npmVersion ? '✓' : '⚠'; ?></span>
            <span class="name">NPM</span>
            <span class="status"><?php echo $npmVersion ? $npmVersion : 'Not Found'; ?></span>
        </div>
    </div>

    <?php if (!$nodeVersion || !$npmVersion): ?>
        <div class="alert alert-warning">
            <strong>Note:</strong> Node.js and NPM are required to run the backend server. 
            You can install them from <a href="https://nodejs.org/" target="_blank">nodejs.org</a>.
        </div>
    <?php endif; ?>

    <?php if ($allPass): ?>
        <div class="alert alert-success">
            <strong>Great!</strong> All PHP requirements are met. You can proceed with the installation.
        </div>
        <div class="button-group">
            <a href="?step=2" class="btn btn-primary">Next: Database Setup →</a>
        </div>
    <?php else: ?>
        <div class="alert alert-error">
            <strong>Error:</strong> Some requirements are not met. Please fix the issues above before proceeding.
        </div>
        <div class="button-group">
            <button onclick="location.reload()" class="btn btn-secondary">Recheck Requirements</button>
        </div>
    <?php endif; ?>
</div>

