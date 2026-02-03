let compareChart = null;

function compareCities() {
    const inputs = $('.comp-input').map((_, el) => $(el).val().trim()).get().filter(v => v !== "");

    if(inputs.length < 2) return alert("Veuillez entrer au moins deux villes.");

    $('#compare-loader').show();
    $('#compare-result').hide();

    const requests = inputs.map(city => 
        $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=fr&appid=${WEATHER_API_KEY}`)
        .catch(() => null)
    );

    Promise.all(requests).then(results => {
        const validResults = results.filter(r => r !== null);
        
        if(validResults.length < 2) {
            $('#compare-loader').hide();
            return alert("Impossible de trouver au moins deux villes valides.");
        }

        renderComparison(validResults);
        $('#compare-loader').hide();
        $('#compare-result').fadeIn();
    });
}

function renderComparison(dataList) {
    // 1. Render Cards
    const $grid = $('#compare-cards');
    $grid.empty();
    
    // Find absolute extremes for highlighting
    const maxTemp = Math.max(...dataList.map(d => d.main.temp));
    
    dataList.forEach((data, i) => {
        const isHottest = data.main.temp === maxTemp;
        const html = createCompareCard(data, isHottest, i);
        $grid.append(html);
    });

    // 2. Render Chart
    renderCompareChart(dataList);

    // 3. Render Table
    renderCompareTable(dataList);
}

function createCompareCard(data, isHottest, index) {
    const temp = Math.round(data.main.temp);
    
    return `
        <div class="compare-card animate-pop" style="animation-delay: ${index * 0.1}s; border-color: ${isHottest ? '#ef4444' : '#3b82f6'}">
            <h3>${data.name}</h3>
            <div class="compare-temp">${temp}°</div>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="icon">
            <p style="text-transform:capitalize; color: #64748b; margin-bottom:1rem;">${data.weather[0].description}</p>
            
            <div class="compare-details">
                <div class="compare-stat">
                    <span>Ressenti</span>
                    <span>${Math.round(data.main.feels_like)}°</span>
                </div>
                <div class="compare-stat">
                    <span>Humidité</span>
                    <span>${data.main.humidity}%</span>
                </div>
                <div class="compare-stat">
                    <span>Vent</span>
                    <span>${Math.round(data.wind.speed * 3.6)}</span>
                </div>
            </div>
            ${isHottest ? '<div class="winner" style="margin-top:1rem; color:#ef4444; font-weight:bold;">🔥 Le plus chaud</div>' : ''}
        </div>
    `;
}

function renderCompareChart(dataList) {
    const ctx = document.getElementById('compareTempChart');
    if(compareChart) compareChart.destroy();

    const labels = dataList.map(d => d.name);
    const temps = dataList.map(d => Math.round(d.main.temp));
    const feels = dataList.map(d => Math.round(d.main.feels_like));

    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#cbd5e1' : '#334155';

    compareChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Température (°C)',
                    data: temps,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: 'Ressenti (°C)',
                    data: feels,
                    backgroundColor: 'rgba(99, 102, 241, 0.3)',
                    borderColor: '#6366f1',
                    borderWidth: 1,
                    borderRadius: 6,
                    hidden: true // Hidden by default to keep it clean
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                y: { ticks: { color: textColor }, grid: { display: false } }, // Simplify grid
                x: { ticks: { color: textColor }, grid: { display: false } }
            }
        }
    });
}

function renderCompareTable(dataList) {
    const $head = $('#table-head');
    const $body = $('#table-body');
    
    // Clear previous
    $head.find('th:not(:first)').remove();
    $body.empty();

    // Headers
    dataList.forEach(d => {
        $head.append(`<th>${d.name}</th>`);
    });

    // Valid rows config
    const rows = [
        { label: "Température", key: d => `${Math.round(d.main.temp)} °C` },
        { label: "Ressenti", key: d => `${Math.round(d.main.feels_like)} °C` },
        { label: "Météo", key: d => d.weather[0].description }, // Capitalize via CSS ideally
        { label: "Humidité", key: d => `${d.main.humidity} %` },
        { label: "Pression", key: d => `${d.main.pressure} hPa` },
        { label: "Vent", key: d => `${Math.round(d.wind.speed * 3.6)} km/h` },
        { label: "Visibilité", key: d => `${(d.visibility/1000).toFixed(1)} km` },
        { label: "Lever Soleil", key: d => new Date(d.sys.sunrise * 1000).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}) },
        { label: "Coucher Soleil", key: d => new Date(d.sys.sunset * 1000).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}) }
    ];

    rows.forEach(row => {
        let tr = `<tr><td>${row.label}</td>`;
        dataList.forEach(d => {
            tr += `<td>${row.key(d)}</td>`;
        });
        tr += `</tr>`;
        $body.append(tr);
    });
}
