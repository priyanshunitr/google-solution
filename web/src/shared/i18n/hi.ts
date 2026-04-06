const hi = {
  translation: {
    back: 'वापस',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    submit: 'जमा करें',

    nav: {
      home: 'होम',
      report: 'रिपोर्ट',
      settings: 'सेटिंग्स',
    },

    home: {
      welcome: 'स्वागत है, अतिथि',
      allClear: 'सब ठीक है',
      allClearDesc: 'इस संपत्ति पर कोई सक्रिय आपातकाल नहीं है।',
      alertActive: 'अलर्ट सक्रिय',
      alertActiveDesc: 'एक आपातकालीन अलर्ट सक्रिय है। निर्देशों का पालन करें।',
      quickActions: 'त्वरित कार्रवाई',
      emergencySOS: 'आपातकालीन SOS',
      sosDesc: 'एक-टैप संकट संकेत',
      reportIssue: 'समस्या रिपोर्ट करें',
      reportDesc: 'सुरक्षा चिंता की रिपोर्ट करें',
      safetyTips: 'सुरक्षा सुझाव',
      tipExits: 'अपने निकास द्वार जानें',
      tipExitsDesc: 'अपने कमरे से निकटतम आपातकालीन निकास का पता लगाएं।',
      tipKey: 'अपना की-कार्ड साथ रखें',
      tipKeyDesc: 'जब भी कमरे से बाहर जाएं तो अपनी रूम की हमेशा साथ रखें।',
      tipApp: 'इस ऐप को खुला रखें',
      tipAppDesc: 'आपातकालीन अलर्ट तुरंत प्राप्त करने के लिए नोटिफिकेशन सक्षम करें।',
      tipElevator: 'आपातकाल में लिफ्ट का उपयोग न करें',
      tipElevatorDesc: 'आग या निकासी की स्थिति में हमेशा सीढ़ियों का उपयोग करें।',
      simulateAlert: 'अलर्ट सिमुलेट करें',
    },

    report: {
      title: 'समस्या रिपोर्ट करें',
      subtitle: 'रिपोर्ट करने के लिए समस्या का प्रकार चुनें',
      fire: 'आग / धुआं',
      fireDesc: 'मुझे आग दिखाई देती है या धुएं की गंध आती है',
      medical: 'चिकित्सा',
      medicalDesc: 'किसी को चिकित्सा सहायता चाहिए',
      safety: 'सुरक्षा चिंता',
      safetyDesc: 'मैं असुरक्षित महसूस करता/करती हूं या कोई खतरा देखता/देखती हूं',
      assistance: 'सहायता',
      assistanceDesc: 'मुझे मदद या सहायता चाहिए',
      confirmTitle: 'क्या आप वाकई इस समस्या की रिपोर्ट करना चाहते हैं? आपका स्थान और सत्र जानकारी साझा की जाएगी।',
      confirmSend: 'पुष्टि करें और भेजें',
      successTitle: 'रिपोर्ट भेजी गई',
      successDesc: 'आपकी रिपोर्ट जमा कर दी गई है। मदद आ रही है।',
      privacyNote: 'आपकी पहचान गुमनाम रहती है। रिपोर्ट के दौरान केवल आपकी सत्र आईडी और स्थान साझा किया जाता है।',
    },

    settings: {
      title: 'सेटिंग्स',
      subtitle: 'अपनी सुरक्षा प्राथमिकताएं कॉन्फ़िगर करें',
      sessionInfo: 'सत्र जानकारी',
      sessionId: 'सत्र आईडी',
      property: 'संपत्ति',
      propertyId: 'संपत्ति आईडी',
      roomNumber: 'कमरा नंबर',
      roomPlaceholder: 'अपना कमरा नंबर दर्ज करें (वैकल्पिक)',
      roomHint: 'आपातकाल में उत्तरदाताओं को आपको तेज़ी से खोजने में मदद करता है।',
      language: 'भाषा',
      location: 'स्थान',
      gpsStatus: 'GPS स्थिति',
      gpsAvailable: 'उपलब्ध',
      gpsUnavailable: 'अनुपलब्ध',
      locationSharing: 'स्थान साझाकरण',
      sharingActive: 'सक्रिय',
      sharingInactive: 'निष्क्रिय',
      locationHint: 'स्थान केवल सक्रिय SOS या आपातकालीन घटनाओं के दौरान साझा किया जाता है।',
      privacyTitle: 'गोपनीयता सूचना',
      privacyDesc: 'आपकी पहचान गुमनाम है। स्थान डेटा केवल सक्रिय सुरक्षा घटनाओं के दौरान या जब आप स्पष्ट रूप से SOS भेजते हैं तब प्रेषित किया जाता है।',
    },

    alert: {
      sendSOS: 'SOS भेजें',
      seeInstructions: 'निर्देश देखें',
      iAmSafe: 'मैं सुरक्षित हूं',
      issuedAt: 'जारी किया गया',
    },

    emergency: {
      fire: 'आग अलर्ट',
      evacuation: 'निकासी',
      medical: 'चिकित्सा अलर्ट',
      lockdown: 'सुरक्षा लॉकडाउन',
      weather: 'गंभीर मौसम',
      critical: 'गंभीर',
      warning: 'चेतावनी',
      info: 'सूचना',
    },

    sos: {
      title: 'तुरंत मदद मांगना',
      howAreYou: 'आप अभी कैसे हैं?',
      tapToSend: 'भेजने के लिए टैप करें',
      helpRequested: 'मदद का अनुरोध किया गया',
      helpDesc: 'शांत रहें। आपका स्थान और स्थिति साझा कर दी गई है।',
      imSafeNow: 'मैं अब सुरक्षित हूं',
      cancelSOS: 'SOS रद्द करें',
      locationWarn: 'स्थान अनुपलब्ध। SOS बिना निर्देशांक के भेजा जाएगा।',
    },

    status: {
      safe: 'मैं सुरक्षित हूं',
      need_help: 'मदद चाहिए',
      unable_to_move: 'हिल नहीं सकता/सकती',
      evacuating: 'निकासी कर रहा/रही हूं',
    },

    guidance: {
      title: 'सुरक्षा निर्देश',
      followSteps: 'इन चरणों का पालन करें',
      stepsCompleted: '{{done}} / {{total}} चरण पूरे हुए',
      needHelp: 'तुरंत मदद चाहिए? SOS भेजें →',
    },

    resolved: {
      allClear: 'सब ठीक है',
      emergencyResolved: 'आपातकाल समाप्त',
      message: 'आपातकालीन स्थिति समाप्त हो गई है। आप सुरक्षित हैं। सुरक्षा निर्देशों का पालन करने के लिए धन्यवाद।',
      resolvedAt: 'समाप्त समय',
      session: 'सत्र',
      sosSent: 'SOS संकेत भेजे गए',
      returnHome: 'होम पर वापस जाएं',
      locationStopped: 'स्थान साझाकरण बंद कर दिया गया है। आपका सत्र सक्रिय रहेगा।',
    },

    locationIndicator: {
      sharing: 'स्थान साझाकरण सक्रिय',
    },
  },
};

export default hi;
