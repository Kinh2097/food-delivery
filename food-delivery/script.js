let userLat, userLng;
let map, directionsService, directionsRenderer;

// Lấy vị trí hiện tại của khách hàng
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLng = position.coords.longitude;
                document.getElementById("userLocation").innerText = `${userLat}, ${userLng}`;

                // Hiển thị bản đồ sau khi có vị trí
                initMap();
            },
            (error) => {
                alert("Không thể lấy vị trí. Hãy bật GPS!");
            }
        );
    } else {
        alert("Trình duyệt không hỗ trợ lấy vị trí.");
    }
}

// Khởi tạo Google Maps
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: userLat, lng: userLng },
        zoom: 14
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
}

// Chuyển địa chỉ thành tọa độ
function getCoordinates(address, callback) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
            const location = results[0].geometry.location;
            callback(location.lat(), location.lng());
        } else {
            alert("Không tìm thấy địa chỉ.");
        }
    });
}

// Tính khoảng cách giữa hai điểm
function getDistance(origin, destination, callback) {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [origin],
            destinations: [destination],
            travelMode: "DRIVING"
        },
        (response, status) => {
            if (status === "OK") {
                const distance = response.rows[0].elements[0].distance.value / 1000; // Đổi sang km
                const duration = response.rows[0].elements[0].duration.text;
                callback(distance, duration);
            } else {
                alert("Không thể tính khoảng cách.");
            }
        }
    );
}

// Tính phí giao hàng
function calculateFee() {
    const address = document.getElementById("address").value;
    const transportMode = document.getElementById("transportMode").value;

    if (!address) {
        alert("Vui lòng nhập địa chỉ giao hàng!");
        return;
    }

    getCoordinates(address, (destLat, destLng) => {
        const origin = new google.maps.LatLng(userLat, userLng);
        const destination = new google.maps.LatLng(destLat, destLng);

        getDistance(origin, destination, (distance, duration) => {
            document.getElementById("distance").innerText = distance.toFixed(2);
            document.getElementById("duration").innerText = duration;

            const feePerKm = 5000; // Đơn giá vận chuyển (VND/km)
            const fee = distance * feePerKm;
            document.getElementById("fee").innerText = fee.toLocaleString();

            drawRoute(destLat, destLng, transportMode);
        });
    });
}

// Vẽ tuyến đường trên bản đồ
function drawRoute(destinationLat, destinationLng, mode) {
    const start = new google.maps.LatLng(userLat, userLng);
    const end = new google.maps.LatLng(destinationLat, destinationLng);

    const request = {
        origin: start,
        destination: end,
        travelMode: mode
    };

    directionsService.route(request, (result, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(result);
        } else {
            alert("Không thể vẽ tuyến đường.");
        }
    });
}

// Gọi hàm lấy vị trí khi trang web tải
getUserLocation();
