import { useMemo, useRef } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import Icons from "../../../../components/components/Icons";
import {
  CLEANER_ICON_DATA_URI,
  HOME_ICON_DATA_URI,
} from "./markerIcons";
import { FLOW_STEPS } from "./serviceConfigs";

const FALLBACK_HOME = {
  latitude: 31.52,
  longitude: 74.35,
};

// homeicon.png — circle on top, "Your Home" label below
const HOME_MARKER = { w: 56, h: 58, ax: 28, ay: 24 };
// provider marker
const PROVIDER_MARKER = { w: 72, h: 56, ax: 36, ay: 38 };

function isValidCoord(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  return (
    Number.isFinite(la) &&
    Number.isFinite(ln) &&
    Math.abs(la) <= 90 &&
    Math.abs(ln) <= 180
  );
}

function buildMapHtml({
  mode,
  home,
  provider,
  hasProviderLocation,
  providerLabel,
  minutesAway,
}) {
  const isMatching = mode === FLOW_STEPS.MATCHING;
  const labelText =
    providerLabel && minutesAway != null
      ? `${providerLabel} - ${minutesAway} mins away`
      : providerLabel
        ? String(providerLabel)
        : minutesAway != null
          ? `${minutesAway} mins away`
          : "";

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
    .eta-label {
      background: #14332C;
      color: #fff;
      font: 600 11px -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 4px 8px;
      border-radius: 8px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var home = [${home.latitude}, ${home.longitude}];
    var provider = ${
      hasProviderLocation
        ? `[${provider.latitude}, ${provider.longitude}]`
        : "null"
    };
    var mode = ${JSON.stringify(mode)};
    var hasProviderLocation = ${hasProviderLocation ? "true" : "false"};
    var labelText = ${JSON.stringify(labelText)};
    var homeIconUrl = ${JSON.stringify(HOME_ICON_DATA_URI)};
    var providerIconUrl = ${JSON.stringify(CLEANER_ICON_DATA_URI)};

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

    function makeDivMarker(latlng, html, size, anchorY) {
      var half = size / 2;
      var icon = L.divIcon({
        className: 'leaflet-div-icon',
        html: html,
        iconSize: [size, size],
        iconAnchor: [half, anchorY != null ? anchorY : half]
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

    if (hasProviderLocation && provider) {
      L.polyline([provider, home], {
        color: '#0E6E4C',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      makeImageMarker(provider, providerIconUrl, {
        w: ${PROVIDER_MARKER.w}, h: ${PROVIDER_MARKER.h},
        ax: ${PROVIDER_MARKER.ax}, ay: ${PROVIDER_MARKER.ay}
      });

      if (labelText) {
        makeDivMarker(
          provider,
          '<div class="eta-label">' + labelText + '</div>',
          140,
          70
        );
      }

      setTimeout(function () {
        map.invalidateSize(true);
        map.fitBounds(L.latLngBounds([home, provider]), {
          padding: [80, 80],
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
      if (hasProviderLocation && provider) {
        map.fitBounds(L.latLngBounds([home, provider]), {
          padding: [80, 80],
          maxZoom: 15,
          animate: true
        });
      } else {
        map.setView(home, 15, { animate: true });
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
  home,
  provider,
  hasProviderLocation = false,
  providerLabel,
  minutesAway,
  /** Only when assigned/on-the-way but tracking lat/lng empty */
  showLocationNotFound = false,
  style,
  showLocate = true,
}) {
  const homePoint = useMemo(() => {
    if (home && isValidCoord(home.latitude ?? home.lat, home.longitude ?? home.lng)) {
      return {
        latitude: Number(home.latitude ?? home.lat),
        longitude: Number(home.longitude ?? home.lng),
      };
    }
    return FALLBACK_HOME;
  }, [home]);

  const providerPoint = useMemo(() => {
    if (
      provider &&
      isValidCoord(provider.latitude ?? provider.lat, provider.longitude ?? provider.lng)
    ) {
      return {
        latitude: Number(provider.latitude ?? provider.lat),
        longitude: Number(provider.longitude ?? provider.lng),
      };
    }
    return null;
  }, [provider]);

  const canTrack = Boolean(hasProviderLocation && providerPoint);

  const html = useMemo(
    () =>
      buildMapHtml({
        mode,
        home: homePoint,
        provider: providerPoint || FALLBACK_HOME,
        hasProviderLocation: canTrack,
        providerLabel,
        minutesAway,
      }),
    [mode, homePoint, providerPoint, canTrack, providerLabel, minutesAway],
  );
  const webRef = useRef(null);

  const mapKey = canTrack
    ? `track-${providerPoint.latitude}-${providerPoint.longitude}-${mode}`
    : `home-${homePoint.latitude}-${homePoint.longitude}-${mode}-nofix`;

  const fitRoute = () => {
    webRef.current?.injectJavaScript?.(
      "window.fitRoute && window.fitRoute(); true;",
    );
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        key={mapKey}
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

      {showLocationNotFound && !canTrack ? (
        <View style={styles.notFoundBanner} pointerEvents="none">
          <Icons
            family="Ionicons"
            name="location-outline"
            size={18}
            color="#14332C"
          />
          <Text style={styles.notFoundText}>Location not found</Text>
        </View>
      ) : null}

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
  notFoundBanner: {
    position: "absolute",
    top: 110,
    alignSelf: "center",
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    zIndex: 12,
  },
  notFoundText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#14332C",
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
