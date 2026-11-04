import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  haversineDistance,
  formatDistance,
  approximateCoordinates,
  getUserGeolocation,
  DEFAULT_CAMPUS_LANDMARKS,
} from './locationService.js';
import MapView from './MapView.jsx';

describe('Location & Maps Service — Prompt 09 (₹0 Baseline)', () => {
  describe('Haversine Straight-Line Distance Calculation', () => {
    it('returns 0 for identical points', () => {
      const dist = haversineDistance(13.0827, 80.2707, 13.0827, 80.2707);
      expect(dist).toBe(0);
    });

    it('calculates known distance between campus landmarks accurately', () => {
      // Central Mess (13.0827, 80.2707) to North Campus Gate (13.0845, 80.2725)
      const dist = haversineDistance(13.0827, 80.2707, 13.0845, 80.2725);
      expect(dist).toBeGreaterThan(0.2);
      expect(dist).toBeLessThan(0.4);
    });

    it('calculates distance between known global cities (London to Paris)', () => {
      // London (51.5074, -0.1278) to Paris (48.8566, 2.3522) ~343.5 km
      const dist = haversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
      expect(dist).toBeGreaterThan(340);
      expect(dist).toBeLessThan(350);
    });

    it('is strictly symmetric: distance(A, B) === distance(B, A)', () => {
      const d1 = haversineDistance(13.0827, 80.2707, 13.0862, 80.2751);
      const d2 = haversineDistance(13.0862, 80.2751, 13.0827, 80.2707);
      expect(d1).toBe(d2);
    });

    it('throws error on non-number or NaN coordinates', () => {
      expect(() => haversineDistance('13.08', 80.27, 13.09, 80.28)).toThrow(
        /coordinates must be valid numbers/i
      );
      expect(() => haversineDistance(NaN, 80.27, 13.09, 80.28)).toThrow(
        /coordinates must be valid numbers/i
      );
    });

    it('throws error on invalid latitude range', () => {
      expect(() => haversineDistance(95, 80.27, 13.09, 80.28)).toThrow(
        /Latitude must be between -90 and 90/i
      );
      expect(() => haversineDistance(-91, 80.27, 13.09, 80.28)).toThrow(
        /Latitude must be between -90 and 90/i
      );
    });

    it('throws error on invalid longitude range', () => {
      expect(() => haversineDistance(13.08, 185, 13.09, 80.28)).toThrow(
        /Longitude must be between -180 and 180/i
      );
      expect(() => haversineDistance(13.08, -181, 13.09, 80.28)).toThrow(
        /Longitude must be between -180 and 180/i
      );
    });
  });

  describe('Distance Formatting & Privacy Approximation', () => {
    it('formats distances under 1 km as meters', () => {
      expect(formatDistance(0.45)).toBe('450 m');
      expect(formatDistance(0.08)).toBe('80 m');
      expect(formatDistance(0.999)).toBe('999 m');
    });

    it('formats distances of 1 km and above as kilometers with 1 decimal', () => {
      expect(formatDistance(1.24)).toBe('1.2 km');
      expect(formatDistance(5.67)).toBe('5.7 km');
      expect(formatDistance(10)).toBe('10.0 km');
    });

    it('handles negative or invalid distance values safely', () => {
      expect(formatDistance(-1)).toBe('Distance unknown');
      expect(formatDistance(NaN)).toBe('Distance unknown');
      expect(formatDistance(null)).toBe('Distance unknown');
    });

    it('coarsens coordinates to ~1 km grid for privacy before claim', () => {
      const coords = approximateCoordinates(13.082745, 80.270789, 2);
      expect(coords.lat).toBe(13.08);
      expect(coords.lng).toBe(80.27);
      expect(coords.isApproximate).toBe(true);
    });

    it('returns null on invalid coordinates in approximateCoordinates', () => {
      expect(approximateCoordinates(null, 80.27)).toBeNull();
      expect(approximateCoordinates(13.08, undefined)).toBeNull();
    });
  });

  describe('Browser Geolocation Handling', () => {
    const originalGeolocation = navigator.geolocation;

    afterEach(() => {
      Object.defineProperty(navigator, 'geolocation', {
        value: originalGeolocation,
        configurable: true,
      });
    });

    it('acquires coordinates when permission is granted', async () => {
      const mockSuccess = vi.fn((success) => {
        success({
          coords: {
            latitude: 13.0827,
            longitude: 80.2707,
            accuracy: 12,
          },
        });
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockSuccess },
        configurable: true,
      });

      const result = await getUserGeolocation();
      expect(result.error).toBeNull();
      expect(result.lat).toBe(13.0827);
      expect(result.lng).toBe(80.2707);
      expect(result.accuracy).toBe(12);
    });

    it('returns PERMISSION_DENIED when user rejects prompt', async () => {
      const mockDenied = vi.fn((_, error) => {
        error({ code: 1, message: 'User denied Geolocation' });
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockDenied },
        configurable: true,
      });

      const result = await getUserGeolocation();
      expect(result.error).toBe('PERMISSION_DENIED');
      expect(result.lat).toBeNull();
      expect(result.message).toMatch(/declined|denied/i);
    });

    it('returns TIMEOUT when geolocation request exceeds duration', async () => {
      const mockTimeout = vi.fn((_, error) => {
        error({ code: 3, message: 'Timeout expired' });
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockTimeout },
        configurable: true,
      });

      const result = await getUserGeolocation();
      expect(result.error).toBe('TIMEOUT');
      expect(result.lat).toBeNull();
    });

    it('returns NOT_SUPPORTED when geolocation API is missing', async () => {
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      });

      const result = await getUserGeolocation();
      expect(result.error).toBe('NOT_SUPPORTED');
    });
  });

  describe('MapView Component (Leaflet + OSM Tiles & Text Fallback)', () => {
    const sampleOpportunities = [
      {
        id: 'opp-1',
        title: 'Dal Makhani & Basmati Rice',
        donorOrg: 'Central Campus Mess',
        quantity: 20,
        unit: 'kg',
        portions: 60,
        lat: 13.0827,
        lng: 80.2707,
        coarseLocation: 'Central Kitchen Loading Bay',
        consumeBy: '23:00',
        pickupStart: '20:00',
        pickupEnd: '22:00',
        dietType: 'Vegetarian',
      },
      {
        id: 'opp-2',
        title: 'Assorted Roti & Mixed Veg Curry',
        donorOrg: 'Engineering Cafeteria',
        quantity: 15,
        unit: 'kg',
        portions: 45,
        lat: 13.0862,
        lng: 80.2751,
        coarseLocation: 'East Tech Quad',
        consumeBy: '22:30',
        pickupStart: '20:30',
        pickupEnd: '21:30',
        dietType: 'Vegetarian',
      },
    ];

    const initialLocation = {
      lat: DEFAULT_CAMPUS_LANDMARKS[0].lat,
      lng: DEFAULT_CAMPUS_LANDMARKS[0].lng,
      name: DEFAULT_CAMPUS_LANDMARKS[0].name,
    };

    it('renders OpenStreetMap attribution and visible strict policy statement', () => {
      render(
        <MapView
          opportunities={sampleOpportunities}
          userLocation={initialLocation}
          onUserLocationChange={vi.fn()}
        />
      );

      expect(screen.getByText(/OpenStreetMap/i)).toBeInTheDocument();
      expect(screen.getByText(/contributors/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Interactive viewport requests only • No route APIs • No tile prefetch/i)
      ).toBeInTheDocument();
    });

    it('renders GPS location detection button and triggers browser prompt', async () => {
      const mockSuccess = vi.fn((success) => {
        success({
          coords: {
            latitude: 13.0845,
            longitude: 80.2725,
            accuracy: 10,
          },
        });
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockSuccess },
        configurable: true,
      });

      const handleLocationChange = vi.fn();
      render(
        <MapView
          opportunities={sampleOpportunities}
          userLocation={initialLocation}
          onUserLocationChange={handleLocationChange}
        />
      );

      const detectBtn = screen.getByRole('button', { name: /Detect My Location/i });
      fireEvent.click(detectBtn);

      await waitFor(() => {
        expect(handleLocationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            lat: 13.0845,
            lng: 80.2725,
            name: 'My GPS Location',
          })
        );
      });
    });

    it('supports selecting a campus landmark as a manual location fallback', () => {
      const handleLocationChange = vi.fn();
      render(
        <MapView
          opportunities={sampleOpportunities}
          userLocation={initialLocation}
          onUserLocationChange={handleLocationChange}
        />
      );

      const landmarkSelect = screen.getByLabelText(/Select Landmark/i);
      fireEvent.change(landmarkSelect, {
        target: { value: 'lm-eng-cafe' },
      });

      expect(handleLocationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: 13.0862,
          lng: 80.2751,
          name: 'Engineering Complex Cafeteria',
        })
      );
    });

    it('supports manual latitude and longitude coordinates pin drop', () => {
      const handleLocationChange = vi.fn();
      render(
        <MapView
          opportunities={sampleOpportunities}
          userLocation={initialLocation}
          onUserLocationChange={handleLocationChange}
        />
      );

      const latInput = screen.getByPlaceholderText(/Latitude/i);
      const lngInput = screen.getByPlaceholderText(/Longitude/i);
      const setPinBtn = screen.getByRole('button', { name: /Set Pin/i });

      fireEvent.change(latInput, { target: { value: '13.0811' } });
      fireEvent.change(lngInput, { target: { value: '80.2699' } });
      fireEvent.click(setPinBtn);

      expect(handleLocationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: 13.0811,
          lng: 80.2699,
        })
      );
    });

    it('toggles to accessible text-list view with Haversine calculated distance', () => {
      render(
        <MapView
          opportunities={sampleOpportunities}
          userLocation={initialLocation}
          onUserLocationChange={vi.fn()}
        />
      );

      const textListToggle = screen.getByRole('button', { name: /Text List/i });
      fireEvent.click(textListToggle);

      expect(screen.getByTestId('text-fallback-list')).toBeInTheDocument();
      expect(screen.getByText(/Dal Makhani & Basmati Rice/i)).toBeInTheDocument();
      expect(screen.getByText(/Assorted Roti & Mixed Veg Curry/i)).toBeInTheDocument();
      expect(screen.getByText(/Haversine straight-line distance/i)).toBeInTheDocument();
    });

    it('enables Claim button only when recipient organisation is eligible', () => {
      const handleSelect = vi.fn();
      const { rerender } = render(
        <MapView
          opportunities={sampleOpportunities}
          userLocation={initialLocation}
          onSelectOpportunity={handleSelect}
          isEligibleToClaim={false}
        />
      );

      // Switch to text mode to inspect claim buttons
      fireEvent.click(screen.getByRole('button', { name: /Text List/i }));
      const disabledBtns = screen.getAllByRole('button', { name: /Verification Required/i });
      expect(disabledBtns[0]).toBeDisabled();

      // Rerender as verified/approved recipient
      rerender(
        <MapView
          opportunities={sampleOpportunities}
          userLocation={initialLocation}
          onSelectOpportunity={handleSelect}
          isEligibleToClaim={true}
        />
      );

      const claimBtns = screen.getAllByRole('button', { name: /Claim Surplus/i });
      expect(claimBtns[0]).not.toBeDisabled();
      fireEvent.click(claimBtns[0]);
      expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'opp-1' }));
    });
  });
});
