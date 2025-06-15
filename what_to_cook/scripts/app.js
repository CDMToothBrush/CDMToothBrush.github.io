async function pickDishes() {
  const res = await fetch('receip.json');
  const data = await res.json();
  const mains = data.filter(d => d["類別"] === "主菜");
  const sides = data.filter(d => d["類別"] === "配菜");
  // 隨機選主菜
  const main = mains[Math.floor(Math.random() * mains.length)];
  // 隨機選3道配菜
  let pickedSides = [];
  let sidePool = [...sides];
  for (let i = 0; i < 3 && sidePool.length > 0; i++) {
    const idx = Math.floor(Math.random() * sidePool.length);
    pickedSides.push(sidePool[idx]);
    sidePool.splice(idx, 1);
  }
  renderDishes(main, pickedSides);
}

function renderDishes(main, sides) {
  const dishesDiv = document.getElementById('dishes');
  dishesDiv.innerHTML = '';
  // 餐桌擺盤：主菜在中間，配菜圍繞
  let html = '';
  html += `<div class="dish-card main">`;
  if (main["youtube"] && main["youtube"].trim() !== "") {
    html += `<a href="${main["youtube"]}" target="_blank" rel="noopener noreferrer"><img src="images/${main["圖片檔名"]}" alt="${main["料理名稱"]}"></a>`;
  } else {
    html += `<img src="images/${main["圖片檔名"]}" alt="${main["料理名稱"]}">`;
  }
  html += `<div class="dish-title">${main["料理名稱"]}</div>`;
  html += `<div class="dish-recipe">${main["食譜"]}</div>`;
  html += `<div style='color:#ff7043;font-size:0.9rem;'>主菜</div>`;
  html += `</div>`;
  sides.forEach(side => {
    html += `<div class="dish-card">`;
    if (side["youtube"] && side["youtube"].trim() !== "") {
      html += `<a href="${side["youtube"]}" target="_blank" rel="noopener noreferrer"><img src="images/${side["圖片檔名"]}" alt="${side["料理名稱"]}"></a>`;
    } else {
      html += `<img src="images/${side["圖片檔名"]}" alt="${side["料理名稱"]}">`;
    }
    html += `<div class="dish-title">${side["料理名稱"]}</div>`;
    html += `<div class="dish-recipe">${side["食譜"]}</div>`;
    html += `<div style='color:#ffb74d;font-size:0.85rem;'>配菜</div>`;
    html += `</div>`;
  });
  dishesDiv.innerHTML = html;
}

document.getElementById('pick-btn').addEventListener('click', pickDishes); 