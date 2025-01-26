document.addEventListener('DOMContentLoaded', function() {
    // 台灣縣市列表
    const cities = [
        '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
        '基隆市', '新竹市', '新竹縣', '苗栗縣', '彰化縣', '南投縣',
        '雲林縣', '嘉義市', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣'
    ];

    // 初始化 Google Maps 服務
    const directionsService = new google.maps.DirectionsService();

    // 填充下拉選單
    const startSelect = document.getElementById('start');
    const endSelect = document.getElementById('end');
    
    cities.forEach(city => {
        startSelect.add(new Option(city, city));
        endSelect.add(new Option(city, city));
    });

    // 預設值設定
    const defaults = {
        gas: { efficiency: 15.3, price: 32, unit: 'km/L' },
        hybrid: { efficiency: 22.6, price: 32, unit: 'km/L' },
        electric: { efficiency: 6.1, price: 5, unit: 'km/度' }
    };

    // 計算兩點間的路線距離
    function calculateRoute() {
        const start = startSelect.value + ', Taiwan';
        const end = endSelect.value + ', Taiwan';

        const request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                const distance = result.routes[0].legs[0].distance.value / 1000;
                document.getElementById('distance').textContent = distance.toFixed(1);
                calculateCosts();
            } else {
                console.error('路線計算錯誤:', status);
                alert('無法計算路線距離，請稍後再試');
            }
        });
    }

    // 更新車輛類型相關設定
    function updateVehicleSettings() {
        const vehicleType = document.getElementById('vehicleType').value;
        const settings = defaults[vehicleType];
        
        document.getElementById('efficiency').value = settings.efficiency;
        document.getElementById('energyPrice').value = settings.price;
        document.getElementById('efficiencyUnit').textContent = settings.unit;
        document.getElementById('priceUnit').textContent = 
            vehicleType === 'electric' ? '元/度' : '元/L';
    }

    // 計算過路費
    function calculateTollFee(distance) {
        if (distance <= 20) return 0;
        if (distance <= 50) return Math.floor((distance - 20) * 1.2);
        if (distance <= 100) return 36 + Math.floor((distance - 50) * 1.2);
        if (distance <= 200) return 96 + Math.floor((distance - 100) * 1.2);
        if (distance <= 300) return 216 + Math.floor((distance - 200) * 0.9);
        return 306 + Math.floor((distance - 300) * 0.9);
    }

    // 計算總費用
    function calculateCosts() {
        const distance = parseFloat(document.getElementById('distance').textContent) || 0;
        const efficiency = parseFloat(document.getElementById('efficiency').value) || 0;
        const energyPrice = parseFloat(document.getElementById('energyPrice').value) || 0;
        const passengers = parseInt(document.getElementById('passengerCount').value) || 1;

        if (distance && efficiency && energyPrice && passengers) {
            const tollFee = calculateTollFee(distance);
            const energyConsumption = distance / efficiency;
            const energyCost = energyConsumption * energyPrice;
            const totalCost = tollFee + energyCost;
            const perPersonCost = totalCost / passengers;

            // 更新顯示結果
            document.getElementById('tollFee').textContent = Math.round(tollFee);
            document.getElementById('energyCost').textContent = Math.round(energyCost);
            document.getElementById('totalCost').textContent = Math.round(totalCost);
            document.getElementById('perPersonCost').textContent = Math.round(perPersonCost);
        }
    }

    // 事件監聽器設定
    document.getElementById('vehicleType').addEventListener('change', () => {
        updateVehicleSettings();
        calculateCosts();
    });

    ['efficiency', 'energyPrice', 'passengerCount'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateCosts);
    });

    [startSelect, endSelect].forEach(select => {
        select.addEventListener('change', calculateRoute);
    });

    // 初始化設定
    updateVehicleSettings();
    
    // 如果有選擇起點和終點，立即計算路線
    if (startSelect.value && endSelect.value) {
        calculateRoute();
    }

    // 設定預設值
    document.getElementById('passengerCount').value = 1;
});