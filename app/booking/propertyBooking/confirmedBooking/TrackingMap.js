import { useMemo, useRef } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import Icons from "../../../../components/components/Icons";
import {
  CLEANER_ICON_DATA_URI,
  HOME_ICON_DATA_URI,
} from "./markerIcons";
import { FLOW_STEPS } from "./serviceConfigs";

const STATIC_HOME = {
  latitude: 31.4187,
  longitude: 73.079,
};

const STATIC_START = {
  latitude: 31.4285,
  longitude: 73.0685,
};

const STATIC_CURRENT = {
  latitude: 31.4232,
  longitude: 73.0742,
};

// homeicon.png 224x231 — circle on top, "Your Home" label below; hotspot = circle center
const HOME_MARKER = { w: 56, h: 58, ax: 28, ay: 24 };
// cleanericon.png 363x279 — status pill on top, green circle below; hotspot = circle center
const CLEANER_MARKER = { w: 72, h: 56, ax: 36, ay: 38 };

function buildMapHtml({ mode, home, start, current }) {
  const isMatching = mode === FLOW_STEPS.MATCHING;
  const isOnWay = mode === FLOW_STEPS.ON_THE_WAY;
  const cleaner = isOnWay ? current : start;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      margin: 0; padding: 0; height: 100%; width: 100%;
      background: #EAF3EE; touch-action: pan-x pan-y;
    }
    .leaflet-control-attribution { display: none; }
    .leaflet-div-icon {
      background: transparent !important;
      border: none !important;
    }
    .mk.soft {
      position: relative;
      width: 14px;
      height: 14px;
    }
    .pin.soft {
      width: 14px; height: 14px; border-radius: 7px; background: #0E6E4C;
      opacity: 0.5;
    }
    .rings-wrap {
      position: relative;
      width: 40px;
      height: 40px;
    }
    .rings {
      position: absolute; left: 50%; top: 50%;
      width: 120px; height: 120px;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .ring {
      position: absolute; inset: 0; border-radius: 50%;
      border: 2px solid rgba(14,110,76,0.16); background: rgba(14,110,76,0.05);
      animation: pulse 2.4s ease-out infinite;
    }
    .ring.r2 { inset: 16px; animation-delay: 0.4s; }
    .ring.r3 { inset: 30px; animation-delay: 0.8s; }
    @keyframes pulse {
      0% { transform: scale(0.75); opacity: 0.85; }
      100% { transform: scale(1.2); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var home = [${home.latitude}, ${home.longitude}];
    var start = [${start.latitude}, ${start.longitude}];
    var current = [${current.latitude}, ${current.longitude}];
    var cleaner = [${cleaner.latitude}, ${cleaner.longitude}];
    var mode = ${JSON.stringify(mode)};
    var homeIconUrl = ${JSON.stringify(HOME_ICON_DATA_URI)};
    var cleanerIconUrl = ${JSON.stringify(CLEANER_ICON_DATA_URI)};

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: true,
      keyboard: true,
      tap: true,
      bounceAtZoomLimits: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3
    }).addTo(map);

    function makeImageMarker(latlng, url, size) {
      var icon = L.icon({
        iconUrl: url,
        iconSize: [size.w, size.h],
        iconAnchor: [size.ax, size.ay]
      });
      return L.marker(latlng, { icon: icon, interactive: false }).addTo(map);
    }

    function makeDivMarker(latlng, html, size) {
      var half = size / 2;
      var icon = L.divIcon({
        className: 'leaflet-div-icon',
        html: html,
        iconSize: [size, size],
        iconAnchor: [half, half]
      });
      return L.marker(latlng, { icon: icon, interactive: false }).addTo(map);
    }

    ${
      isMatching
        ? `makeDivMarker(home, '<div class="rings-wrap"><div class="rings"><div class="ring"></div><div class="ring r2"></div><div class="ring r3"></div></div></div>', 40);`
        : ""
    }

    makeImageMarker(home, homeIconUrl, {
      w: ${HOME_MARKER.w}, h: ${HOME_MARKER.h},
      ax: ${HOME_MARKER.ax}, ay: ${HOME_MARKER.ay}
    });

    if (mode !== ${JSON.stringify(FLOW_STEPS.MATCHING)}) {
      var route = [
        start,
        [${(start.latitude + home.latitude) / 2 + 0.001}, ${(start.longitude + home.longitude) / 2 - 0.001}],
        [${(start.latitude + home.latitude) / 2 - 0.0005}, ${(start.longitude + home.longitude) / 2 + 0.002}],
        home
      ];

      L.polyline(route, {
        color: '#0E6E4C',
        weight: 5,
        opacity: mode === ${JSON.stringify(FLOW_STEPS.ON_THE_WAY)} ? 0.25 : 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      if (mode === ${JSON.stringify(FLOW_STEPS.ON_THE_WAY)}) {
        L.polyline([
          current,
          [${(current.latitude + home.latitude) / 2}, ${(current.longitude + home.longitude) / 2}],
          home
        ], {
          color: '#0E6E4C',
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        makeDivMarker(start, '<div class="mk soft"><div class="pin soft"></div></div>', 14);
      }

      makeImageMarker(cleaner, cleanerIconUrl, {
        w: ${CLEANER_MARKER.w}, h: ${CLEANER_MARKER.h},
        ax: ${CLEANER_MARKER.ax}, ay: ${CLEANER_MARKER.ay}
      });

      setTimeout(function () {
        map.invalidateSize(true);
        map.fitBounds(L.latLngBounds([home, start, cleaner]), {
          padding: [70, 70],
          maxZoom: 15,
          animate: false
        });
      }, 250);
    } else {
      setTimeout(function () {
        map.invalidateSize(true);
        map.setView(home, 15, { animate: false });
      }, 250);
    }

    window.fitRoute = function () {
      map.invalidateSize(true);
      if (mode === ${JSON.stringify(FLOW_STEPS.MATCHING)}) {
        map.setView(home, 15, { animate: true });
      } else {
        map.fitBounds(L.latLngBounds([home, start, cleaner]), {
          padding: [70, 70],
          maxZoom: 15,
          animate: true
        });
      }
    };

    window.addEventListener('resize', function () {
      map.invalidateSize(true);
    });
  </script>
</body>
</html>`;
}

export default function TrackingMap({
  mode = FLOW_STEPS.MATCHING,
  home = STATIC_HOME,
  start = STATIC_START,
  current = STATIC_CURRENT,
  style,
  showLocate = true,
}) {
  const html = useMemo(
    () =>
      buildMapHtml({
        mode,
        home,
        start,
        current,
      }),
    [mode, home, start, current],
  );
  const webRef = useRef(null);

  const fitRoute = () => {
    webRef.current?.injectJavaScript?.(
      "window.fitRoute && window.fitRoute(); true;",
    );
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        key={mode}
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        nestedScrollEnabled
        scrollEnabled={false}
        scalesPageToFit={false}
        bounces={false}
        overScrollMode="never"
        allowsInlineMediaPlayback
        onLoadEnd={fitRoute}
        {...(Platform.OS === "ios"
          ? { allowsBackForwardNavigationGestures: false }
          : {})}
      />

      {showLocate ? (
        <TouchableOpacity
          style={styles.locateBtn}
          onPress={fitRoute}
          activeOpacity={0.85}
        >
          <Icons
            family="Ionicons"
            name="locate-outline"
            size={20}
            color="#14332C"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#EAF3EE",
  },
  map: {
    flex: 1,
    backgroundColor: "#EAF3EE",
  },
  locateBtn: {
    position: "absolute",
    right: 16,
    bottom: 320,
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
