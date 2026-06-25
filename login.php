<?php
session_start();

$error = "";

$admin_username = "admin";
$admin_password = "12345";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST["username"];
    $password = $_POST["password"];

    if ($username === $admin_username && $password === $admin_password) {
        $_SESSION["admin"] = $username;
        header("Location: dashboard.php");
        exit();
    } else {
        $error = "Invalid username or password.";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Admin Login</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="page-wrap">

  <div class="banner-wrap">
    <div class="banner-placeholder">
      VAP – admin page
    </div>
  </div>

  <div class="intro-block">
    <div class="intro-text">
      Please login first to manage the admin dashboard.
    </div>
  </div>

</div>

<div class="cards-wrap">
  <div class="card" style="max-width:450px; margin:0 auto;">
    <div class="card-title">ADMIN LOGIN</div>

    <?php if ($error != ""): ?>
      <p style="color:red; margin-bottom:15px;"><?php echo $error; ?></p>
    <?php endif; ?>

    <form method="POST">

      <div class="form-grid-1">
        <div class="field">
          <label>Username</label>
          <input type="text" name="username" placeholder="Enter username" required>
        </div>
      </div>

      <div class="form-grid-1">
        <div class="field">
          <label>Password</label>
          <input type="password" name="password" placeholder="Enter password" required>
        </div>
      </div>

      <button type="submit" class="btn-submit">
        Login
      </button>

    </form>
  </div>
</div>

</body>
</html>