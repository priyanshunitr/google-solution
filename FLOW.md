# CrisisSync App Flow

This document visualizes the high-level user journey and state-driven routing of the CrisisSync application.

## High-Level User Journey

```mermaid
flowchart TD
  A[App Launch] --> B[Role Selection]
  B -->|guest| C[Guest Home]
  B -->|staff| D[Staff Dashboard]
  B -->|responder| E[Responder Dashboard]

  C --> F{Emergency active?}
  F -->|No| C
  F -->|Yes| G[Emergency Mode]
  G --> H[Alert Screen]
  H --> I[Announcement Channel]
  H --> J[SOS Screen]
  H --> K[Guidance Screen]

  D --> L[Review Alerts and SOS]
  L --> M[Respond or Escalate]
  L --> N[Broadcast Announcements]
  L --> O[Toggle Emergency Mode]

  E --> P[View Escalated Incidents]
  P --> Q[Acknowledge or Resolve]
  E --> R[Private Staff Chat]
  E --> S[Responder Broadcast]
```

## Emergency Sub-Screen Navigation (Guest)

```mermaid
stateDiagram-v2
  [*] --> alert
  alert --> sos: tap Send SOS
  alert --> guidance: tap See Instructions
  alert --> channel: tap Open Announcement Channel

  channel --> sos: tap Raise SOS
  channel --> guidance: tap View Guidance

  sos --> channel: back when isEmergencyMode=true
  sos --> alert: back when local emergency flow
  guidance --> channel: back when isEmergencyMode=true
  guidance --> alert: back when local emergency flow
```
