import { useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import fonts from "../../../../components/assets/fonts";
import Icons from "../../../../components/components/Icons";

const ACCENT = "#0E6E4C";

const STATIC_HOME = {
  latitude: 31.4187,
  longitude: 73.079,
};

const STATIC_TEAM = {
  latitude: 31.4285,
  longitude: 73.0685,
};

function buildMapHtml(home, team) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #EDE8F5; }
    .pin {
      width: 36px; height: 36px; border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }
    .label {
      margin-top: 4px; background: #fff; border-radius: 10px;
      padding: 2px 8px; font: 600 11px/16px -apple-system, sans-serif;
      color: #17121F; white-space: nowrap; text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    .dot {
      display: inline-block; width: 6px; height: 6px; border-radius: 3px;
      background: ${ACCENT}; margin-right: 4px; vertical-align: middle;
    }
    .wrap { text-align: center; transform: translateY(-8px); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var home = [${home.latitude}, ${home.longitude}];
    var team = [${team.latitude}, ${team.longitude}];
    var map = L.map('map', { zoomControl: false, attributionControl: true })
      .setView([${(home.latitude + team.latitude) / 2}, ${(home.longitude + team.longitude) / 2}], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var route = [
      team,
      [${team.latitude - 0.0017}, ${team.longitude + 0.0027}],
      [${team.latitude - 0.004}, ${team.longitude + 0.0053}],
      [${team.latitude - 0.0065}, ${team.longitude + 0.008}],
      home
    ];
    L.polyline(route, { color: '#6E5C9A', weight: 5, opacity: 0.95 }).addTo(map);

    var homeIcon = L.divIcon({
      className: '',
      html: '<div class="wrap"><div class="pin" style="background:#17121F">🏠</div><div class="label">Your Home</div></div>',
      iconSize: [90, 58],
      iconAnchor: [45, 58]
    });
    var teamIcon = L.divIcon({
      className: '',
      html: '<div class="wrap"><div class="pin" style="background:${ACCENT}">🚚</div><div class="label"><span class="dot"></span>Team</div></div>',
      iconSize: [70, 58],
      iconAnchor: [35, 58]
    });

    L.marker(home, { icon: homeIcon }).addTo(map);
    L.marker(team, { icon: teamIcon }).addTo(map);
    map.fitBounds(L.latLngBounds(route), { padding: [50, 50] });

    window.fitRoute = function () {
      map.fitBounds(L.latLngBounds(route), { padding: [50, 50], animate: true });
    };
  </script>
</body>
</html>`;
}

export default function TrackingMap({
  home = STATIC_HOME,
  team = STATIC_TEAM,
  eta = "8 min",
  distance = "1.4 mi",
  style,
}) {
  const html = useMemo(() => buildMapHtml(home, team), [home, team]);
  const webRef = useRef(null);

  const fitRoute = () => {
    webRef.current?.injectJavaScript?.(
      "window.fitRoute && window.fitRoute(); true;",
    );
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
      />

      <View style={styles.etaBadge} pointerEvents="none">
        <View style={styles.etaDot} />
        <Text style={styles.etaText}>{eta} away</Text>
        <View style={styles.etaDivider} />
        <Text style={styles.etaText}>{distance}</Text>
      </View>

      <TouchableOpacity
        style={styles.locateBtn}
        onPress={fitRoute}
        activeOpacity={0.85}
      >
        <Icons
          family="Ionicons"
          name="locate-outline"
          size={20}
          color="#17121F"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#EDE8F5",
  },
  map: {
    flex: 1,
    backgroundColor: "#EDE8F5",
  },
  etaBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ACCENT,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    zIndex: 10,
  },
  etaDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  etaText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
  etaDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  locateBtn: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    zIndex: 10,
  },
});
