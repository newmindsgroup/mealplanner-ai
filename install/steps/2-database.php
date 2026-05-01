<?php
// Step 2: Database Configuration

$error = null;
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $host = $_POST['db_host'] ?? 'localhost';
    $database = $_POST['db_name'] ?? '';
    $username = $_POST['db_user'] ?? '';
    $password = $_POST['db_password'] ?? '';

    if (empty($database) || empty($username)) {
        $error = 'Database name and username are required.';
    } else {
        // Test database connection
        $conn = @new mysqli($host, $username, $password);

        if ($conn->connect_error) {
            $error = 'Connection failed: ' . $conn->connect_error;
        } else {
            // Check if database exists
            $dbExists = $conn->select_db($database);

            if (!$dbExists) {
                // Try to create database
                $createDb = $conn->query("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

                if (!$createDb) {
                    $error = 'Could not create database. Please create it manually or check permissions.';
                } else {
                    $dbExists = true;
                }
            }

            if ($dbExists) {
                // Store in session
                $_SESSION['db_config'] = [
                    'host' => $host,
                    'name' => $database,
                    'user' => $username,
                    'password' => $password,
                ];

                $success = true;
                $conn->close();

                // Redirect to next step
                header('Location: ?step=3');
                exit;
            }

            $conn->close();
        }
    }
}

// Get saved values
$savedHost = $_SESSION['db_config']['host'] ?? 'localhost';
$savedDatabase = $_SESSION['db_config']['name'] ?? 'mealplan_assistant';
$savedUsername = $_SESSION['db_config']['user'] ?? '';
?>

<div class="step-indicator">
    <div class="step completed">1. Requirements</div>
    <div class="step active">2. Database</div>
    <div class="step">3. Admin</div>
    <div class="step">4. Install</div>
    <div class="step">5. Complete</div>
</div>

<div class="card">
    <h2>Database Configuration</h2>
    <p>Enter your MySQL database credentials:</p>

    <?php if ($error): ?>
        <div class="alert alert-error">
            <strong>Error:</strong> <?php echo htmlspecialchars($error); ?>
        </div>
    <?php endif; ?>

    <form method="POST" id="databaseForm">
        <div class="form-group">
            <label for="db_host">Database Host</label>
            <input type="text" 
                   id="db_host" 
                   name="db_host" 
                   value="<?php echo htmlspecialchars($savedHost); ?>" 
                   placeholder="localhost" 
                   required>
            <small>Usually "localhost" or "127.0.0.1"</small>
        </div>

        <div class="form-group">
            <label for="db_name">Database Name</label>
            <input type="text" 
                   id="db_name" 
                   name="db_name" 
                   value="<?php echo htmlspecialchars($savedDatabase); ?>" 
                   placeholder="mealplan_assistant" 
                   required>
            <small>The database will be created if it doesn't exist</small>
        </div>

        <div class="form-group">
            <label for="db_user">Database Username</label>
            <input type="text" 
                   id="db_user" 
                   name="db_user" 
                   value="<?php echo htmlspecialchars($savedUsername); ?>" 
                   placeholder="root" 
                   required>
        </div>

        <div class="form-group">
            <label for="db_password">Database Password</label>
            <input type="password" 
                   id="db_password" 
                   name="db_password" 
                   placeholder="********">
            <small>Leave blank if no password is set</small>
        </div>

        <div class="button-group">
            <a href="?step=1" class="btn btn-secondary">← Back</a>
            <button type="button" onclick="testConnection()" class="btn btn-secondary">Test Connection</button>
            <button type="submit" class="btn btn-primary">Next: Admin Setup →</button>
        </div>
    </form>
</div>

<script>
function testConnection() {
    const form = document.getElementById('databaseForm');
    const formData = new FormData(form);
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Testing...';

    // Just submit the form - the same validation will run
    form.submit();
}
</script>

