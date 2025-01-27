// script.js

// 获取页面元素的引用
let originInput = document.getElementById('origin');
let destinationInput = document.getElementById('destination');
let vehicleTypeInput = document.getElementById('vehicleType');
let fuelConsumptionInput = document.getElementById('fuelConsumption');
let consumptionUnitSpan = document.getElementById('consumptionUnit');
let fuelPriceInput = document.getElementById('fuelPrice');
let priceUnitSpan = document.getElementById('priceUnit');
let peopleInput = document.getElementById('people');
let calculateBtn = document.getElementById('calculateBtn');

let totalDistanceInput = document.getElementById('totalDistance');
let tollFeeInput = document.getElementById('tollFee');
let energyCostInput = document.getElementById('energyCost');
let totalCostInput = document.getElementById('totalCost');

// 页面加载时设置默认值
window.onload = function() {
    setDefaultValues();
};

// 当车辆种类变化时，更新默认值
vehicleTypeInput.addEventListener('change', function() {
    setDefaultValues();
});

// 设置默认值函数
function setDefaultValues() {
    let vehicleType = vehicleTypeInput.value;
    if (vehicleType === 'gasoline') {
        fuelConsumptionInput.value = 15.3;
        consumptionUnitSpan.innerText = 'km/L';
        fuelPriceInput.value = 32;
        priceUnitSpan.innerText = '元/L';
    } else if (vehicleType === 'hybrid') {
        fuelConsumptionInput.value = 22.6;
        consumptionUnitSpan.innerText = 'km/L';
        fuelPriceInput.value = 32;
        priceUnitSpan.innerText = '元/L';
    } else if (vehicleType === 'electric') {
        fuelConsumptionInput.value = 6.1;
        consumptionUnitSpan.innerText = 'km/度';
        fuelPriceInput.value = 5;
        priceUnitSpan.innerText = '元/度';
    }
}

// 点击计算按钮时的事件处理器
calculateBtn.addEventListener('click', function() {
    let origin = originInput.value;
    let destination = destinationInput.value;

    if (!origin || !destination) {
        alert('請選擇起點和終點');
        return;
    }

    getDistance(origin, destination);
});

// 获取路线距离的函数
function getDistance(origin, destination) {
    let directionsService = new google.maps.DirectionsService();

    let request = {
        origin: origin,
        destination: destination,
        travelMode: 'DRIVING',
        provideRouteAlternatives: false,
        avoidTolls: false
    };

    directionsService.route(request, function(result, status) {
        if (status === 'OK') {
            let route = result.routes[0];

            let totalDistance = route.legs[0].distance.value; // 单位：公尺

            // 将公尺转换为公里，保留两位小数
            totalDistance = (totalDistance / 1000).toFixed(2);

            totalDistanceInput.value = totalDistance;

            // 添加 tollDistance 变量，令其为 totalDistance 减去 3
            let tollDistance = totalDistance - 3;

            // 确保 tollDistance 不为负数
            if (tollDistance < 0) {
                tollDistance = 0;
            }

            // 计算过路费
            let tollFee = calculateTollFee(parseFloat(tollDistance));
            tollFeeInput.value = tollFee;

            // 计算能源费用和每人应付费用
            calculateCosts(parseFloat(totalDistance), tollFee);
        } else {
            alert('無法取得路線資訊：' + status);
        }
    });
}



// 计算过路费的函数
function calculateTollFee(x) {
    let y = 0;
    if (x <= 20) {
        y = 0;
    } else if (x <= 50) {
        y = Math.floor((x - 20) * 1.2);
    } else if (x <= 100) {
        y = 36 + Math.floor((x - 50) * 1.2);
    } else if (x <= 200) {
        y = 96 + Math.floor((x - 100) * 1.2);
    } else if (x <= 300) {
        y = 216 + Math.floor((x - 200) * 0.9);
    } else if (x <= 400) {
        y = 306 + Math.floor((x - 300) * 0.9);
    }
    return y;
}

// 计算能源费用和每人应付费用的函数
function calculateCosts(totalDistance, tollFee) {
    let vehicleType = vehicleTypeInput.value;
    let fuelConsumption = parseFloat(fuelConsumptionInput.value);
    let fuelPrice = parseFloat(fuelPriceInput.value);
    let people = parseInt(peopleInput.value);

    let energyCost = 0;

    if (vehicleType === 'gasoline' || vehicleType === 'hybrid' || vehicleType === 'electric') {
        energyCost = (totalDistance / fuelConsumption) * fuelPrice;
    }

    // 显示能源费用，保留两位小数
    energyCostInput.value = energyCost.toFixed(2);

    // 计算每人应付费用
    let totalCostPerPerson = (energyCost + tollFee) / people;

    totalCostInput.value = totalCostPerPerson.toFixed(2);
}