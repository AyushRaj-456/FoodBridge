import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  List,
  Map as MapIcon,
  AlertTriangle,
  CheckCircle,
  Building,
  Navigation,
  Clock,
  Utensils,
} from 'lucide-react';
import {
  haversineDistance,
  formatDistance,
  getUserGeolocation,
  DEFAULT_CAMPUS_LANDMARKS,
} from './locationService.js';
import './map.css';

/**
 * MapView — Leaflet + OpenStreetMap & Text-List Proximity Component
 *
 * Strict ₹0 Spark Constraints:
 * 1. OpenStreetMap standard tiles with visible attribution and policy-compliant viewport requests.
 * 2. No Google Maps, Mapbox, geocoding API, route API, or tile prefetching.
 * 3. Haversine straight-line distance calculation only (no road routing or ETA).
 * 4. Browser Geolocation with explicit permission and manual pin/address fallback.
 * 5. Text-list fallback rendered if tiles fail or low-data mode is preferred.
 */
export default function MapView({
  opportunities = [],
  userLocation = {
    lat: DEFAULT_CAMPUS_LANDMARKS[0].lat,
    lng: DEFAULT_CAMPUS_LANDMARKS[0].lng,
    name: DEFAULT_CAMPUS_LANDMARKS[0].name,
  },
  onUserLocationChange,
  onSelectOpportunity,
  isEligibleToClaim = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [viewMode, setViewMode] = useState('map'); // 'map' | 'text'
  const [tilesFailed, setTilesFailed] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState(null);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState(DEFAULT_CAMPUS_LANDMARKS[0].id);
  const [manualCoords, setManualCoords] = useState({
    lat: String(userLocation.lat),
    lng: String(userLocation.lng),
  });

  // Calculate straight-line distances and sort opportunities
  const opportunitiesWithDistance = useMemo(() => {
    return opportunities
      .map((opp) => {
        let distanceKm = null;
        if (
          typeof opp.lat === 'number' &&
          typeof opp.lng === 'number' &&
          typeof userLocation.lat === 'number' &&
          typeof userLocation.lng === 'number'
        ) {
          try {
            distanceKm = haversineDistance(userLocation.lat, userLocation.lng, opp.lat, opp.lng);
          } catch {
            distanceKm = null;
          }
        }
        return {
          ...opp,
          calculatedDistanceKm: distanceKm,
        };
      })
      .sort((a, b) => {
        if (a.calculatedDistanceKm === null) return 1;
        if (b.calculatedDistanceKm === null) return -1;
        return a.calculatedDistanceKm - b.calculatedDistanceKm;
      });
  }, [opportunities, userLocation]);

  // Request browser geolocation with permission
  const handleDetectLocation = async () => {
    setGeoLoading(true);
    setGeoStatus(null);

    const result = await getUserGeolocation();
    setGeoLoading(false);

    if (result.error) {
      setGeoStatus({
        type: 'error',
        message: result.message,
      });
    } else {
      setGeoStatus({
        type: 'success',
        message: `Detected within ~${Math.round(result.accuracy || 10)}m accuracy.`,
      });
      if (onUserLocationChange) {
        onUserLocationChange({
          lat: result.lat,
          lng: result.lng,
          name: 'My GPS Location',
        });
      }
      setManualCoords({
        lat: result.lat.toFixed(4),
        lng: result.lng.toFixed(4),
      });
      setSelectedLandmarkId('');
    }
  };

  // Handle Landmark dropdown selection
  const handleLandmarkChange = (e) => {
    const landmarkId = e.target.value;
    setSelectedLandmarkId(landmarkId);
    const landmark = DEFAULT_CAMPUS_LANDMARKS.find((lm) => lm.id === landmarkId);
    if (landmark && onUserLocationChange) {
      onUserLocationChange({
        lat: landmark.lat,
        lng: landmark.lng,
        name: landmark.name,
      });
      setManualCoords({
        lat: String(landmark.lat),
        lng: String(landmark.lng),
      });
      setGeoStatus(null);
    }
  };

  // Handle manual coordinate input
  const handleManualCoordsSubmit = (e) => {
    e.preventDefault();
    const parsedLat = parseFloat(manualCoords.lat);
    const parsedLng = parseFloat(manualCoords.lng);

    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      setGeoStatus({
        type: 'error',
        message: 'Invalid latitude. Must be between -90 and 90.',
      });
      return;
    }

    if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      setGeoStatus({
        type: 'error',
        message: 'Invalid longitude. Must be between -180 and 180.',
      });
      return;
    }

    if (onUserLocationChange) {
      onUserLocationChange({
        lat: parsedLat,
        lng: parsedLng,
        name: `Manual Pin (${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)})`,
      });
    }
    setGeoStatus({
      type: 'success',
      message: 'Location updated via manual coordinates.',
    });
    setSelectedLandmarkId('');
  };

  // Leaflet Map Lifecycle Effect
  useEffect(() => {
    if (viewMode !== 'map' || tilesFailed || !mapContainerRef.current) {
      return;
    }

    // Guard for JSDOM test environment where full Leaflet DOM APIs may not exist
    if (typeof window === 'undefined' || !mapContainerRef.current.clientWidth) {
      return;
    }

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [userLocation.lat, userLocation.lng],
          zoom: 14,
          zoomControl: true,
          attributionControl: true,
        });

        // OpenStreetMap Standard Tiles (Policy Compliant, Visible Attribution)
        const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        });

        tileLayer.on('tileerror', (errorEvent) => {
          console.warn('[FoodBridge Map] OpenStreetMap tile loading failed:', errorEvent);
          setTilesFailed(true);
        });

        tileLayer.addTo(map);

        // Click on map to place manual pin
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          if (onUserLocationChange) {
            onUserLocationChange({
              lat: Math.round(lat * 10000) / 10000,
              lng: Math.round(lng * 10000) / 10000,
              name: 'Dropped Pin',
            });
          }
          setManualCoords({
            lat: lat.toFixed(4),
            lng: lng.toFixed(4),
          });
          setSelectedLandmarkId('');
          setGeoStatus({
            type: 'success',
            message: 'Manual pin placed on map.',
          });
        });

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng]);
      }

      // Update markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();

        // 1. User / Recipient Pin
        const userIcon = L.divIcon({
          className: 'custom-map-pin recipient-pin',
          html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
        userMarker.bindPopup(`
          <div style="font-family: var(--font-family); font-size: 13px; line-height: 1.4;">
            <strong>Your Location (Reference Point)</strong><br />
            ${userLocation.name || 'Recipient Position'}<br />
            <small style="color: #666;">${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</small>
          </div>
        `);
        markersLayerRef.current.addLayer(userMarker);

        // 2. Surplus Opportunity Pins
        opportunitiesWithDistance.forEach((opp) => {
          if (typeof opp.lat !== 'number' || typeof opp.lng !== 'number') return;

          const distLabel =
            opp.calculatedDistanceKm !== null ? formatDistance(opp.calculatedDistanceKm) : '';

          const oppIcon = L.divIcon({
            className: 'custom-map-pin surplus-pin',
            html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const oppMarker = L.marker([opp.lat, opp.lng], { icon: oppIcon });
          oppMarker.bindPopup(`
            <div style="font-family: var(--font-family); font-size: 13px; line-height: 1.4; max-width: 220px;">
              <strong style="color: #15803d;">${opp.title}</strong><br />
              <span>${opp.quantity} ${opp.unit} (~${opp.portions} meals)</span><br />
              <small style="color: #4b5563;">Donor: ${opp.donorOrg}</small><br />
              <div style="margin-top: 4px; padding: 2px 6px; background: #f3f4f6; border-radius: 4px; display: inline-block; font-weight: 600;">
                Straight-Line: ~${distLabel}
              </div><br />
              <div style="margin-top: 6px;">
                <button type="button" id="btn-claim-${opp.id}" style="width: 100%; padding: 4px 8px; background: #15803d; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">
                  View &amp; Claim Surplus
                </button>
              </div>
            </div>
          `);

          oppMarker.on('popupopen', () => {
            const btn = document.getElementById(`btn-claim-${opp.id}`);
            if (btn && onSelectOpportunity) {
              btn.onclick = () => onSelectOpportunity(opp);
            }
          });

          markersLayerRef.current.addLayer(oppMarker);
        });
      }
    } catch (err) {
      console.warn('[FoodBridge Map] Leaflet map initialization bypassed:', err.message);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Ignore cleanup errors during unmount
        }
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [
    viewMode,
    tilesFailed,
    userLocation,
    opportunitiesWithDistance,
    onSelectOpportunity,
    onUserLocationChange,
  ]);

  return (
    <div className="map-container-wrapper" data-testid="map-view-wrapper">
      {/* Map Toolbar & Proximity Controls */}
      <div className="map-toolbar">
        <div className="map-controls-group">
          {/* Geolocation Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDetectLocation}
            disabled={geoLoading}
            style={{ minHeight: '34px', fontSize: 'var(--font-size-label)' }}
            aria-label="Detect My Location"
          >
            <Compass size={16} />
            <span>{geoLoading ? 'Detecting...' : 'Detect GPS Location'}</span>
          </button>

          {/* Campus Landmark Fallback Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Building size={16} className="text-muted" />
            <select
              aria-label="Select Landmark"
              className="input-field"
              value={selectedLandmarkId}
              onChange={handleLandmarkChange}
              style={{
                width: 'auto',
                minHeight: '34px',
                padding: 'var(--space-1) var(--space-2)',
                fontSize: 'var(--font-size-caption)',
              }}
            >
              <option value="">Manual Coordinates / Pin</option>
              {DEFAULT_CAMPUS_LANDMARKS.map((lm) => (
                <option key={lm.id} value={lm.id}>
                  {lm.name} ({lm.coarseArea})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle (Map vs Text List Fallback) */}
        <div className="map-controls-group">
          <div
            style={{
              display: 'flex',
              background: 'var(--color-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '2px',
            }}
          >
            <button
              type="button"
              className={`btn ${viewMode === 'map' && !tilesFailed ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setTilesFailed(false);
                setViewMode('map');
              }}
              style={{
                minHeight: '28px',
                padding: '2px 8px',
                fontSize: 'var(--font-size-caption)',
              }}
              disabled={tilesFailed}
            >
              <MapIcon size={14} />
              <span>Map View</span>
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'text' || tilesFailed ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('text')}
              style={{
                minHeight: '28px',
                padding: '2px 8px',
                fontSize: 'var(--font-size-caption)',
              }}
            >
              <List size={14} />
              <span>Text List ({opportunitiesWithDistance.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Pin / Coordinates Input Bar */}
      <form
        onSubmit={handleManualCoordsSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: 'var(--font-size-caption)',
        }}
      >
        <MapPin size={14} className="text-muted" />
        <span className="text-muted">Manual Coordinates Fallback:</span>
        <label htmlFor="manual-lat" className="sr-only">
          Latitude
        </label>
        <input
          id="manual-lat"
          type="number"
          step="0.0001"
          placeholder="Latitude (e.g. 13.0827)"
          value={manualCoords.lat}
          onChange={(e) => setManualCoords((prev) => ({ ...prev, lat: e.target.value }))}
          className="input-field"
          style={{ width: '130px', minHeight: '28px', padding: '2px 6px', fontSize: '12px' }}
        />
        <label htmlFor="manual-lng" className="sr-only">
          Longitude
        </label>
        <input
          id="manual-lng"
          type="number"
          step="0.0001"
          placeholder="Longitude (e.g. 80.2707)"
          value={manualCoords.lng}
          onChange={(e) => setManualCoords((prev) => ({ ...prev, lng: e.target.value }))}
          className="input-field"
          style={{ width: '130px', minHeight: '28px', padding: '2px 6px', fontSize: '12px' }}
        />
        <button
          type="submit"
          className="btn btn-secondary"
          style={{ minHeight: '28px', padding: '2px 8px', fontSize: '12px' }}
        >
          Set Pin
        </button>
        <span className="text-muted" style={{ marginLeft: 'auto' }}>
          Current Pin: <strong>{userLocation.name}</strong>
        </span>
      </form>

      {/* Geolocation Feedback Message */}
      {geoStatus && (
        <div
          role="status"
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background:
              geoStatus.type === 'error' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
            color: geoStatus.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-size-caption)',
          }}
        >
          {geoStatus.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
          <span>{geoStatus.message}</span>
        </div>
      )}

      {/* Tile Failure Alert Banner */}
      {tilesFailed && (
        <div
          className="map-fallback-banner"
          style={{
            background: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            borderBottom: '1px solid var(--color-warning)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertTriangle size={16} />
            <span>
              <strong>Map Tiles Unavailable:</strong> OpenStreetMap standard tile network is
              unreachable. Text list fallback is active with Haversine distance calculations.
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setTilesFailed(false)}
            style={{ minHeight: '28px', padding: '2px 8px', fontSize: 'var(--font-size-caption)' }}
          >
            Retry Map
          </button>
        </div>
      )}

      {/* View Mode 1: Leaflet Interactive Map View */}
      {viewMode === 'map' && !tilesFailed ? (
        <div
          ref={mapContainerRef}
          className="map-viewport"
          data-testid="leaflet-map-element"
          aria-label="Interactive surplus proximity map"
        />
      ) : (
        /* View Mode 2: Accessible Text-List Fallback (Policy & Offline Compliant) */
        <div className="text-fallback-list" data-testid="text-fallback-list">
          <div
            style={{
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--color-canvas)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <Navigation size={14} color="var(--color-brand-700)" />
            <span>
              Listings ranked by <strong>Haversine straight-line distance</strong> from your
              selected pin (<code>{userLocation.name}</code>).
            </span>
          </div>

          {opportunitiesWithDistance.length === 0 ? (
            <div
              style={{
                padding: 'var(--space-4)',
                textAlign: 'center',
                color: 'var(--color-muted)',
              }}
            >
              No surplus food opportunities available in this proximity zone.
            </div>
          ) : (
            opportunitiesWithDistance.map((opp) => (
              <div key={opp.id} className="text-fallback-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="badge badge-neutral">
                      {opp.calculatedDistanceKm !== null
                        ? `Approx. ${formatDistance(opp.calculatedDistanceKm)} away`
                        : 'Distance unknown'}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{opp.title}</h3>
                    <span className="badge badge-success">{opp.dietType}</span>
                  </div>

                  <div
                    style={{
                      fontSize: 'var(--font-size-label)',
                      color: 'var(--color-muted)',
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    Donor: <strong>{opp.donorOrg}</strong> &bull; Quantity:{' '}
                    <strong>
                      {opp.quantity} {opp.unit}
                    </strong>{' '}
                    (~{opp.portions} meals) &bull; Coarse Area: {opp.coarseLocation}
                  </div>

                  <div
                    style={{
                      fontSize: 'var(--font-size-caption)',
                      color: 'var(--color-muted)',
                      marginTop: 'var(--space-1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <Clock size={12} />
                    <span>
                      Consume-by: <strong>{opp.consumeBy}</strong> | Pickup window:{' '}
                      {opp.pickupStart} – {opp.pickupEnd}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {isEligibleToClaim ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => onSelectOpportunity && onSelectOpportunity(opp)}
                    >
                      <Utensils size={14} />
                      <span>Claim Surplus</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled
                      title="Recipient organisation verification required to claim surplus"
                    >
                      Verification Required
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* OpenStreetMap Attribution & Policy Statement */}
      <div className="osm-attribution-notice">
        <div>
          Map data &copy;{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenStreetMap
          </a>{' '}
          contributors &bull; Rendered via Leaflet (BSD-2-Clause)
        </div>
        <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
          Strict ₹0 Policy: Interactive viewport requests only &bull; No route APIs &bull; No tile
          prefetch
        </div>
      </div>
    </div>
  );
}
