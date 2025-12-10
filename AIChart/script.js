document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadSection = document.getElementById('upload-section');
    const chartSection = document.getElementById('chart-section');
    const chartContainer = document.getElementById('chart-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const resetBtn = document.getElementById('reset-btn');

    const chartTypeBtns = document.querySelectorAll('.chart-type-btn');
    
    let chartInstance = null;
    let currentChartData = null; // Store processed data for switching types
    let currentChartType = 'line';

    // Event Listeners
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary', 'bg-white/5');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-primary', 'bg-white/5');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary', 'bg-white/5');
        const files = e.dataTransfer.files;
        if (files.length) handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    resetBtn.addEventListener('click', resetApp);

    window.addEventListener('resize', () => {
        if (chartInstance) chartInstance.resize();
    });

    // Chart Type Switching
    chartTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            if (type === currentChartType) return;

            // Update UI
            chartTypeBtns.forEach(b => {
                b.classList.remove('bg-primary', 'text-white', 'shadow-lg');
                b.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-900', 'dark:hover:text-white', 'hover:bg-white', 'dark:hover:bg-white/5');
            });
            btn.classList.remove('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-900', 'dark:hover:text-white', 'hover:bg-white', 'dark:hover:bg-white/5');
            btn.classList.add('bg-primary', 'text-white', 'shadow-lg');

            currentChartType = type;
            if (currentChartData) {
                renderChart(currentChartData.xAxisData, currentChartData.seriesData, currentChartType);
            }
        });
    });

    const themeToggleBtn = document.getElementById('theme-toggle');
    const exportBtns = document.querySelectorAll('.export-btn');

    // Theme Management
    // Check for saved theme or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark';
        } else {
            localStorage.theme = 'light';
        }

        // Update chart if it exists
        if (chartInstance && currentChartData) {
            renderChart(currentChartData.xAxisData, currentChartData.seriesData, currentChartType);
        }
    });

    // Export Functionality
    exportBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!chartInstance) return;
            const format = btn.dataset.format;
            const isDark = document.documentElement.classList.contains('dark');
            const bgColor = isDark ? '#0f172a' : '#ffffff'; // Adapt bg color for export

            const url = chartInstance.getDataURL({
                type: format,
                backgroundColor: bgColor,
                pixelRatio: 2 // Higher resolution
            });
            
            const link = document.createElement('a');
            link.download = `chart-export.${format}`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

    function handleFile(file) {
        if (!file) return;

        // Reset UI
        errorMessage.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
        dropZone.classList.add('opacity-50', 'pointer-events-none');

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                
                // Assume first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
                
                if (jsonData.length < 2) {
                    throw new Error("File appears to be empty or has no data rows.");
                }

                processDataAndRender(jsonData);

            } catch (err) {
                showError(err.message || "Failed to parse Excel file.");
                resetUploadState();
            }
        };

        reader.onerror = () => {
            showError("Error reading file.");
            resetUploadState();
        };

        reader.readAsArrayBuffer(file);
    }

    function processDataAndRender(rawData) {
        // Basic processing logic (to be refined)
        const headers = rawData[0];
        const rows = rawData.slice(1);

        // 1. Identify Time Column
        // Heuristic: Look for 'date', 'time', 'year' in header, or check first few rows for Date objects
        let timeColIndex = -1;
        
        // Check headers first
        const timeKeywords = ['date', 'time', 'datetime', 'year', 'month', 'day', 'timestamp'];
        timeColIndex = headers.findIndex(h => h && timeKeywords.some(k => String(h).toLowerCase().includes(k)));

        // If not found in header, check data types of first valid row
        if (timeColIndex === -1 && rows.length > 0) {
            const sampleRow = rows.find(r => r && r.length > 0);
            if (sampleRow) {
                timeColIndex = sampleRow.findIndex(cell => cell instanceof Date);
            }
        }

        // If still not found, default to first column
        if (timeColIndex === -1) timeColIndex = 0;

        // 2. Identify Series Columns (Numerical)
        const seriesIndices = [];
        const sampleRow = rows.find(r => r && r.length > 0);
        
        if (sampleRow) {
            headers.forEach((h, idx) => {
                if (idx !== timeColIndex) {
                    // Check if column has numeric data
                    const isNumeric = rows.some(r => r[idx] !== null && !isNaN(Number(r[idx])));
                    if (isNumeric) seriesIndices.push(idx);
                }
            });
        }

        if (seriesIndices.length === 0) {
            throw new Error("No numerical data columns found to plot.");
        }

        // 3. Prepare Data for ECharts
        const timeData = rows.map(r => {
            const val = r[timeColIndex];
            // Format date if it's a Date object
            if (val instanceof Date) {
                return val.toISOString().split('T')[0]; // Simple YYYY-MM-DD
            }
            return val;
        });

        const seriesDataRaw = seriesIndices.map(idx => {
            return {
                name: headers[idx] || `Series ${idx + 1}`,
                data: rows.map(r => r[idx])
            };
        });

        // Store data for switching
        currentChartData = { xAxisData: timeData, seriesData: seriesDataRaw };
        
        // Reset type to Line on new upload
        currentChartType = 'line';
        resetTypeButtons();

        renderChart(timeData, seriesDataRaw, currentChartType);
    }

    function resetTypeButtons() {
        chartTypeBtns.forEach(btn => {
            if (btn.dataset.type === 'line') {
                btn.classList.remove('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-900', 'dark:hover:text-white', 'hover:bg-white', 'dark:hover:bg-white/5');
                btn.classList.add('bg-primary', 'text-white', 'shadow-lg');
            } else {
                btn.classList.remove('bg-primary', 'text-white', 'shadow-lg');
                btn.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-900', 'dark:hover:text-white', 'hover:bg-white', 'dark:hover:bg-white/5');
            }
        });
    }

    function renderChart(xAxisData, seriesDataRaw, type) {
        // Hide upload, show chart
        uploadSection.classList.add('hidden');
        chartSection.classList.remove('hidden');
        loadingIndicator.classList.add('hidden');
        dropZone.classList.remove('opacity-50', 'pointer-events-none');

        if (chartInstance) chartInstance.dispose();
        chartInstance = echarts.init(chartContainer);

        // Determine Theme Colors
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const axisLineColor = isDark ? '#475569' : '#cbd5e1';
        const splitLineColor = isDark ? '#334155' : '#e2e8f0';
        const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
        const tooltipText = isDark ? '#f8fafc' : '#1e293b';

        // Transform series data based on type
        const series = seriesDataRaw.map(s => {
            const item = {
                name: s.name,
                data: s.data,
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: { borderWidth: 2 },
                lineStyle: { width: 3 }
            };

            if (type === 'line') {
                item.type = 'line';
            } else if (type === 'bar') {
                item.type = 'bar';
                item.itemStyle = { borderRadius: [4, 4, 0, 0] };
            } else if (type === 'area') {
                item.type = 'line';
                item.areaStyle = { opacity: 0.3 };
            } else if (type === 'scatter') {
                item.type = 'scatter';
            } else if (type === 'stacked') {
                item.type = 'bar';
                item.stack = 'total';
                item.emphasis = { focus: 'series' };
            }

            return item;
        });

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                textStyle: {
                    color: tooltipText
                }
            },
            legend: {
                data: series.map(s => s.name),
                textStyle: {
                    color: textColor
                },
                top: 0 // Moved to top to avoid overlap with dataZoom
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%', // Increased bottom space for dataZoom
                top: '10%', // Added top space for legend
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: type === 'bar' || type === 'stacked', // Bar charts need gap
                data: xAxisData,
                axisLine: {
                    lineStyle: {
                        color: axisLineColor
                    }
                },
                axisLabel: {
                    color: textColor
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        color: splitLineColor,
                        type: 'dashed'
                    }
                },
                axisLabel: {
                    color: textColor
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                },
                {
                    start: 0,
                    end: 100,
                    handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    handleStyle: {
                        color: isDark ? '#fff' : '#475569',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    textStyle: {
                        color: textColor
                    },
                    borderColor: splitLineColor
                }
            ],
            series: series
        };

        chartInstance.setOption(option);
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function resetUploadState() {
        loadingIndicator.classList.add('hidden');
        dropZone.classList.remove('opacity-50', 'pointer-events-none');
        fileInput.value = '';
    }

    function resetApp() {
        chartSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        resetUploadState();
        errorMessage.classList.add('hidden');
        if (chartInstance) {
            chartInstance.dispose();
            chartInstance = null;
        }
    }
});
