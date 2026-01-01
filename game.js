let enemy = {
  name: "Bolha de Ar",
  hp: 1,
  def: 0,
  maxHp: 1
};

let player = {
  coins: 0,
  power: 1
};

const hpEl = document.getElementById("hp");
const coinsEl = document.getElementById("coins");
const powerEl = document.getElementById("power");
const enemyImg = document.getElementById("enemyImg");

function updateUI() {
  hpEl.textContent = enemy.hp;
  coinsEl.textContent = player.coins;
  powerEl.textContent = player.power;
}

document.getElementById("attackBtn").onclick = () => {
  const damage = Math.max(1, player.power - enemy.def);
  enemy.hp -= damage;

  // animação simples
  enemyImg.style.transform = "scale(0.95)";
  setTimeout(() => enemyImg.style.transform = "scale(1)", 100);

  if (enemy.hp <= 0) {
    player.coins += 1;
    enemy.hp = enemy.maxHp;
  }

  updateUI();
};

document.getElementById("upgradePower").onclick = () => {
  if (player.coins >= 5) {
    player.coins -= 5;
    player.power += 1;
    updateUI();
  }
};

updateUI();
