const en = {
  translation: {
    // Common
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    submit: 'Submit',

    // Nav
    nav: {
      home: 'Home',
      report: 'Report',
      settings: 'Settings',
    },

    // Home Screen
    home: {
      welcome: 'Welcome, Guest',
      allClear: 'All Clear',
      allClearDesc: 'No active emergencies at this property.',
      alertActive: 'Alert Active',
      alertActiveDesc: 'An emergency alert is active. Follow instructions.',
      quickActions: 'Quick Actions',
      emergencySOS: 'Emergency SOS',
      sosDesc: 'One-tap distress signal',
      reportIssue: 'Report Issue',
      reportDesc: 'Report a safety concern',
      safetyTips: 'Safety Tips',
      tipExits: 'Know your exits',
      tipExitsDesc: 'Locate the nearest emergency exit from your room.',
      tipKey: 'Keep your key card handy',
      tipKeyDesc: 'Always carry your room key when you leave your room.',
      tipApp: 'Keep this app open',
      tipAppDesc: 'Enable notifications to receive emergency alerts instantly.',
      tipElevator: 'No elevators during emergencies',
      tipElevatorDesc: 'Always use stairs during fire or evacuation events.',
      simulateAlert: 'Simulate Alert',
    },

    // Report Screen
    report: {
      title: 'Report an Issue',
      subtitle: 'Select the type of problem you want to report',
      fire: 'Fire / Smoke',
      fireDesc: 'I see fire or smell smoke',
      medical: 'Medical',
      medicalDesc: 'Someone needs medical help',
      safety: 'Safety Concern',
      safetyDesc: 'I feel unsafe or see a threat',
      assistance: 'Assistance',
      assistanceDesc: 'I need help or support',
      confirmTitle: 'Are you sure you want to report this issue? Your location and session info will be shared.',
      confirmSend: 'Confirm & Send',
      successTitle: 'Report Sent',
      successDesc: 'Your report has been submitted. Help is on the way.',
      privacyNote: 'Your identity remains anonymous. Only your session ID and location are shared during reports.',
    },

    // Settings Screen
    settings: {
      title: 'Settings',
      subtitle: 'Configure your safety preferences',
      sessionInfo: 'Session Info',
      sessionId: 'Session ID',
      property: 'Property',
      propertyId: 'Property ID',
      roomNumber: 'Room Number',
      roomPlaceholder: 'Enter your room number (optional)',
      roomHint: 'Helps responders locate you faster during emergencies.',
      language: 'Language',
      location: 'Location',
      gpsStatus: 'GPS Status',
      gpsAvailable: 'Available',
      gpsUnavailable: 'Unavailable',
      locationSharing: 'Location Sharing',
      sharingActive: 'Active',
      sharingInactive: 'Inactive',
      locationHint: 'Location is shared only during active SOS or emergency events.',
      privacyTitle: 'Privacy Notice',
      privacyDesc: 'Your identity is anonymized. Location data is only transmitted during active safety events or when you explicitly send an SOS. No personal information is stored beyond your session.',
    },

    // Alert Screen
    alert: {
      sendSOS: 'Send SOS',
      seeInstructions: 'See Instructions',
      iAmSafe: 'I am Safe',
      issuedAt: 'Issued at',
    },

    // Emergency Types
    emergency: {
      fire: 'Fire Alert',
      evacuation: 'Evacuation',
      medical: 'Medical Alert',
      lockdown: 'Security Lockdown',
      weather: 'Severe Weather',
      critical: 'CRITICAL',
      warning: 'WARNING',
      info: 'INFO',
    },

    // SOS Screen
    sos: {
      title: 'Asking for Immediate Help',
      howAreYou: 'How are you right now?',
      tapToSend: 'Tap to send',
      helpRequested: 'Help Requested',
      helpDesc: 'Stay calm. Your location and status have been shared.',
      imSafeNow: "I'm Safe Now",
      cancelSOS: 'Cancel SOS',
      locationWarn: 'Location unavailable. SOS will be sent without coordinates.',
    },

    // Status Options
    status: {
      safe: 'I am Safe',
      need_help: 'Need Help',
      unable_to_move: 'Cannot Move',
      evacuating: 'Evacuating',
    },

    // Guidance Screen
    guidance: {
      title: 'Safety Instructions',
      followSteps: 'Follow these steps',
      stepsCompleted: '{{done}} / {{total}} steps completed',
      needHelp: 'Need immediate help? Send SOS →',
    },

    // Resolved Screen
    resolved: {
      allClear: 'All Clear',
      emergencyResolved: 'Emergency Resolved',
      message: 'The emergency situation has been resolved. You are safe. Thank you for following the safety instructions.',
      resolvedAt: 'Resolved at',
      session: 'Session',
      sosSent: 'SOS signals sent',
      returnHome: 'Return to Home',
      locationStopped: 'Location sharing has been stopped. Your session remains active.',
    },

    // Location Indicator
    locationIndicator: {
      sharing: 'Location sharing active',
    },
  },
};

export default en;
