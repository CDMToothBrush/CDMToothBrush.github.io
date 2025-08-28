console.log('程式碼載入中...');

let db;
let SQL;
let selectedUser = 'Benson';
let datePicker; // 新增 datePicker 變數

// 初始化資料庫
async function initDB() {
    try {
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        const savedDB = localStorage.getItem('weightDB');
        if (savedDB) {
            const uint8Array = new Uint8Array(JSON.parse(savedDB));
            db = new SQL.Database(uint8Array);
        } else {
            db = new SQL.Database();
            db.run(`
                CREATE TABLE IF NOT EXISTS weight_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user TEXT NOT NULL,
                    date TEXT NOT NULL,
                    weight REAL NOT NULL,
                    body_fat REAL NOT NULL,
                    visceral_fat REAL NOT NULL
                )
            `);
        }
        console.log('資料庫初始化成功');
        return true;
    } catch (error) {
        console.error('資料庫初始化失敗:', error);
        return false;
    }
}

// 儲存資料庫狀態
function saveDB() {
    if (!db) return;
    const data = db.export();
    const array = Array.from(data);
    localStorage.setItem('weightDB', JSON.stringify(array));
    console.log('資料庫狀態已儲存');
}

// 讀取資料
function loadData(user) {
    if (!db || !user) {
        console.error('資料庫未初始化或使用者未指定');
        return [];
    }

    try {
        const results = db.exec(`
            SELECT date, weight, body_fat as bodyFat, visceral_fat as visceralFat 
            FROM weight_records 
            WHERE user = '${user}' 
            ORDER BY date
        `);
        
        if (results.length === 0) {
            return [];
        }
        
        return results[0].values.map(row => ({
            date: row[0],
            weight: row[1],
            bodyFat: row[2],
            visceralFat: row[3]
        }));
    } catch (error) {
        console.error('讀取資料失敗:', error);
        return [];
    }
}

// 定義圖表物件
let charts = {
    weight: null,
    bodyFat: null,
    visceralFat: null
};

// 更新圖表
function updateCharts() {
    const userData = loadData(selectedUser);
    console.log('載入的使用者資料:', userData);
    const dates = userData.map(d => d.date);

    // 體重圖表
    if (charts.weight) charts.weight.destroy();
    charts.weight = new Chart(
        document.getElementById('weight-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '體重 (kg)',
                    data: userData.map(d => d.weight),
                    borderColor: '#4F8A8B',
                    backgroundColor: 'rgba(79,138,139,0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${selectedUser} 的體重變化`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        }
    );

    // 體脂率圖表
    if (charts.bodyFat) charts.bodyFat.destroy();
    charts.bodyFat = new Chart(
        document.getElementById('body-fat-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '體脂率 (%)',
                    data: userData.map(d => d.bodyFat),
                    borderColor: '#F9A826',
                    backgroundColor: 'rgba(249,168,38,0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${selectedUser} 的體脂率變化`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        }
    );

    // 內脂圖表
    if (charts.visceralFat) charts.visceralFat.destroy();
    charts.visceralFat = new Chart(
        document.getElementById('visceral-fat-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '內脂',
                    data: userData.map(d => d.visceralFat),
                    borderColor: '#FF6F61',
                    backgroundColor: 'rgba(255,111,97,0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${selectedUser} 的內脂變化`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        }
    );
}

// 格式化日期為 YYYY-MM-DD，強制使用本地時間
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM 載入完成');
    
    // 初始化日期選擇器，使用本地時間
    datePicker = flatpickr("#date", {
        locale: "zh",
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        maxDate: new Date(),
        disableMobile: false,
        // 強制使用本地時間
        formatDate: (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        parseDate: (dateStr) => {
            const [year, month, day] = dateStr.split('-');
            return new Date(year, parseInt(month) - 1, day);
        }
    });
    console.log('日期選擇器已初始化');

    // 初始化資料庫
    const dbInitialized = await initDB();
    if (!dbInitialized) {
        alert('資料庫初始化失敗');
        return;
    }

    // 初始化使用者選擇器
    const userSelector = document.getElementById('user-selector');
    userSelector.innerHTML = `
        <select id="user">
            <option value="Benson">Benson</option>
            <option value="Marvis">Marvis</option>
        </select>
    `;

    // 監聽使用者選擇變更
    document.getElementById('user').addEventListener('change', (e) => {
        selectedUser = e.target.value;
        console.log('選擇使用者:', selectedUser);
        updateCharts();
    });

    // 提交按鈕事件處理
    document.getElementById('submit-data').addEventListener('click', () => {
        const selectedDate = datePicker.selectedDates[0];
        if (!selectedDate) {
            alert('請選擇日期');
            return;
        }
        
        // 使用新的格式化函數
        const dateStr = formatDate(selectedDate);
        console.log('儲存的日期:', dateStr); // 除錯用
        
        const weight = parseFloat(document.getElementById('weight').value);
        const bodyFat = parseFloat(document.getElementById('body-fat').value);
        const visceralFat = parseFloat(document.getElementById('visceral-fat').value);

        if (isNaN(weight) || isNaN(bodyFat) || isNaN(visceralFat)) {
            alert('請輸入有效的數值');
            return;
        }

        try {
            db.run(
                'INSERT INTO weight_records (user, date, weight, body_fat, visceral_fat) VALUES (?, ?, ?, ?, ?)',
                [selectedUser, dateStr, weight, bodyFat, visceralFat]
            );
            
            saveDB();
            updateCharts();
            
            // 清空輸入欄位
            datePicker.setDate(new Date());
            document.getElementById('weight').value = '';
            document.getElementById('body-fat').value = '';
            document.getElementById('visceral-fat').value = '';
            
            console.log('新資料已儲存');
        } catch (error) {
            console.error('儲存資料失敗:', error);
            alert('儲存資料失敗');
        }
    });

    // 初始顯示圖表
    updateCharts();
});

// 匯出資料庫檔案
function downloadDB() {
    if (!db) return;
    
    const data = db.export();
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weight_tracker.db';
    a.click();
    
    URL.revokeObjectURL(url);
}