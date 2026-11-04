# Food Matching Engine

## Eligibility first, distance second

Candidate eligibility is deterministic and safety-gated. A nearby organisation is not eligible merely because it is close.

1. Recipient organisation is approved and active.
2. Membership is active and user is authorised to act for that organisation.
3. Route tier matches recipient category and approved capability.
4. Food category and declared restrictions are compatible.
5. Facility capacity and pickup window are compatible.
6. Listing is published and unexpired.
7. Only then calculate proximity and rank candidates.

## Location model

Use browser Geolocation API after an explicit permission prompt. If denied, allow manual pin placement or address text. Store geohash and coordinates only with consent. Public feed returns approximate coordinates; exact pickup details are disclosed only after a successful claim.

## Radius matching

Use a geohash range helper to query candidate documents around the listing. Query a configurable set of radius bands (for example 3 km, 5 km, 10 km) and deduplicate by organisation ID. Then compute exact great-circle distance using Haversine and filter against the selected radius. Sort by distance, eligibility and capacity; document the ranking formula.

This is straight-line distance, not road distance or travel time. Do not claim route ETA. Do not call Google Maps, Mapbox, GraphHopper hosted API or any paid route provider.

## Map display

Leaflet + OpenStreetMap tile service, visibly attributed. Follow OSM's current tile policy, no bulk downloads/offline tiles, no excessive requests. If tiles fail, show a textual list with approximate distance.

## Expansion and concurrency

Radius expansion can broaden discovery but never relax route/safety eligibility. Claims are secured by a Firestore transaction; exactly one recipient can win. A failed claim refreshes the listing and displays the reason.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
