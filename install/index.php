<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meal Plan Assistant - Installation</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍽️ Meal Plan Assistant</h1>
            <p>Installation Wizard</p>
        </div>

        <?php
        // Check if already installed
        if (file_exists('../.env') && file_exists('.installed')) {
            echo '<div class="alert alert-warning">';
            echo '<h2>Already Installed</h2>';
            echo '<p>The application is already installed. If you need to reinstall, please delete the <code>.env</code> file and <code>install/.installed</code> file first.</p>';
            echo '<a href="/" class="btn btn-primary">Go to Application</a>';
            echo '</div>';
            exit;
        }

        // Start session
        session_start();

        // Get current step
        $step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
        $step = max(1, min(5, $step)); // Clamp between 1 and 5

        // Include step file
        $stepFile = "steps/{$step}-" . getStepName($step) . ".php";
        
        if (file_exists($stepFile)) {
            include $stepFile;
        } else {
            echo '<div class="alert alert-error">';
            echo '<h2>Error</h2>';
            echo '<p>Installation step not found.</p>';
            echo '</div>';
        }

        function getStepName($step) {
            $steps = [
                1 => 'requirements',
                2 => 'database',
                3 => 'admin',
                4 => 'config',
                5 => 'complete',
            ];
            return $steps[$step] ?? 'requirements';
        }
        ?>

        <div class="footer">
            <p>&copy; <?php echo date('Y'); ?> Meal Plan Assistant. All rights reserved.</p>
        </div>
    </div>

    <script src="assets/script.js"></script>
</body>
</html>

