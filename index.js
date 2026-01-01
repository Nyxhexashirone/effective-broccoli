<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Destroyer Idle</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<header>
  <h1>Destroyer Idle</h1>
</header>

<main class="game">
  <!-- INIMIGO -->
  <section class="enemy">
    <h2>Bolha de Ar</h2>

    <div class="enemy-image">
      <img id="enemyImg" src="https://via.placeholder.com/200" alt="Inimigo">
    </div>

    <div class="stats">
      <div>HP: <span id="hp">1</span></div>
      <div>DEF: <span id="def">0</span></div>
    </div>

    <button id="attackBtn">Atacar</button>
  </section>

  <!-- UPGRADES -->
  <section class="upgrades">
    <h2>Upgrades</h2>

    <div class="player-stats">
      <p>Moedas: <span id="coins">0</span></p>
      <p>Poder: <span id="power">1</span></p>
    </div>

    <div class="upgrade-list">
      <button class="upgrade" id="upgradePower">
        +1 Poder (Custo: 5)
      </button>
    </div>
  </section>
</main>

<script src="game.js"></script>
</body>
</html>
