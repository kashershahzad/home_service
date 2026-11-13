import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const DEFAULT = { latitude: 31.52, longitude: 74.35 };

function buildHtml(accent) {
  const pin = String(accent || "#0E6E4C");
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin:0; padding:0; height:100%; width:100%; background:#EAF3EE; }
    .leaflet-control-attribution { font-size: 10px; }
    .leaflet-div-icon { background: transparent !important; border: none !important; }
    .pin {
      width: 22px; height: 22px; border-radius: 50% 50% 50% 0;
      background: ${pin}; transform: rotate(-45deg);
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([31.52, 74.35], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var icon = L.divIcon({
      className: 'leaflet-div-icon',
      html: '<div class="pin"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 22]
    });

    var marker = L.marker([31.52, 74.35], { icon: icon, draggable: true }).addTo(map);

    function send(lat, lng) {
      var payload = JSON.stringify({ type: 'coord', latitude: lat, longitude: lng });
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
    }

    marker.on('dragend', function () {
      var p = marker.getLatLng();
      send(p.lat, p.lng);
    });

    map.on('click', function (e) {
      marker.setLatLng(e.latlng);
      send(e.latlng.lat, e.latlng.lng);
    });

    function setCoord(lat, lng, animate) {
      var ll = L.latLng(lat, lng);
      marker.setLatLng(ll);
      if (animate) map.flyTo(ll, Math.max(map.getZoom(), 15), { duration: 0.45 });
      else map.setView(ll, Math.max(map.getZoom(), 15), { animate: false });
    }

    document.addEventListener('message', handleNative);
    window.addEventListener('message', handleNative);
    function handleNative(event) {
      try {
        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'setCoord') setCoord(data.latitude, data.longitude, !!data.animate);
      } catch (e) {}
    }

    setTimeout(function () { map.invalidateSize(true); }, 200);
  </script>
</body>
</html>`;
}

const OsmMapPicker = forwardRef(function OsmMapPicker(
  { coordinate, accent = "#0E6E4C", onCoordinateChange, style },
  ref,
) {
  const webRef = useRef(null);
  const readyRef = useRef(false);
  const html = useMemo(() => buildHtml(accent), [accent]);

  const injectCoord = (lat, lng, animate) => {
    const script = `setCoord(${Number(lat)}, ${Number(lng)}, ${animate ? "true" : "false"}); true;`;
    webRef.current?.injectJavaScript(script);
  };

  useImperativeHandle(ref, () => ({
    setCoordinate: (lat, lng, animate = true) => injectCoord(lat, lng, animate),
  }));

  useEffect(() => {
    if (!readyRef.current) return;
    const lat = Number(coordinate?.latitude) || DEFAULT.latitude;
    const lng = Number(coordinate?.longitude) || DEFAULT.longitude;
    injectCoord(lat, lng, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinate?.latitude, coordinate?.longitude]);

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === "coord") {
        onCoordinateChange?.({
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        });
      }
    } catch (_) {}
  };

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.web}
        onMessage={onMessage}
        onLoadEnd={() => {
          readyRef.current = true;
          const lat = Number(coordinate?.latitude) || DEFAULT.latitude;
          const lng = Number(coordinate?.longitude) || DEFAULT.longitude;
          injectCoord(lat, lng, false);
        }}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowsInlineMediaPlayback
        setSupportMultipleWindows={false}
        // Android nested scroll / gestures
        nestedScrollEnabled
        {...(Platform.OS === "ios"
          ? { allowsBackForwardNavigationGestures: false }
          : {})}
      />
    </View>
  );
});

export default OsmMapPicker;

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: "hidden" },
  web: { flex: 1, backgroundColor: "#EAF3EE" },
});
