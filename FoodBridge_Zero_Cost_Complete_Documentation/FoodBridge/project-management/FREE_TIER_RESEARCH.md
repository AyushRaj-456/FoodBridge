# Free-Tier Research Notes

Research checked on 4 November 2026. Provider terms can change; re-check before launch.

## Firebase plan

Firebase documents Spark as its no-cost plan with no payment information needed. It provides no-cost quotas for Firestore, Hosting and Realtime Database, while most non-phone Authentication methods and Cloud Messaging are no-cost products. Spark projects cannot use paid Google Cloud products such as Cloud Run or Pub/Sub. Linking a billing account or using certain Google Cloud products/Google Maps APIs can move a project to Blaze. Source: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans

## Firestore

Standard Firestore free-tier figures: 1 GiB stored data, 50,000 document reads/day, 20,000 writes/day, 20,000 deletes/day and 10 GiB/month outbound transfer. Free tier applies to one database per project. Source: https://docs.cloud.google.com/firestore/quotas

## Hosting

Firebase Hosting currently provides up to 10 GB stored hosting content and 10 GB/month data transfer at no cost. Spark sites can stop accepting deploys or be disabled after quota limits. Source: https://firebase.google.com/docs/hosting/usage-quotas-pricing

## Firebase Storage

Firebase states that Spark projects do not have access to Cloud Storage buckets; bucket access requires the Blaze pay-as-you-go plan. Therefore shared uploads are excluded from this design. Source: https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024

## Phone authentication

Firebase Auth limits documentation states verification SMS is Blaze/pay-as-you-go only. Therefore phone OTP is excluded. Source: https://firebase.google.com/docs/auth/limits

## OpenStreetMap

OSM data is free, but the standard public tile servers are donation-funded, best-effort, have no SLA and enforce usage requirements. Visible attribution, correct HTTPS endpoint, caching, no bulk download/offline use and no abusive request volume are required. Source: https://operations.osmfoundation.org/policies/tiles/

Public Nominatim geocoding is limited (including a maximum of one request per second and moderate user-triggered usage); it is not a generic geocoding backend. FoodBridge therefore uses manual pin placement and address entry instead. Source: https://operations.osmfoundation.org/policies/nominatim/

## Implication

This research supports a limited, controlled pilot—not unlimited production traffic. Zero cost means no charges while within the no-cost plan and selected policies; it does not guarantee unlimited capacity, permanent free service, uptime or future unchanged terms.
