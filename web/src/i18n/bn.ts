const bn = {
  translation: {
    back: 'পেছনে',
    cancel: 'বাতিল',
    confirm: 'নিশ্চিত করুন',
    submit: 'জমা দিন',

    nav: {
      home: 'হোম',
      report: 'রিপোর্ট',
      settings: 'সেটিংস',
    },

    home: {
      welcome: 'স্বাগতম, অতিথি',
      allClear: 'সব ঠিক আছে',
      allClearDesc: 'এই সম্পত্তিতে কোনো সক্রিয় জরুরি অবস্থা নেই।',
      alertActive: 'সতর্কতা সক্রিয়',
      alertActiveDesc: 'একটি জরুরি সতর্কতা সক্রিয়। নির্দেশনা অনুসরণ করুন।',
      quickActions: 'দ্রুত পদক্ষেপ',
      emergencySOS: 'জরুরি SOS',
      sosDesc: 'এক-ট্যাপ সংকট সংকেত',
      reportIssue: 'সমস্যা রিপোর্ট করুন',
      reportDesc: 'একটি নিরাপত্তা উদ্বেগ রিপোর্ট করুন',
      safetyTips: 'নিরাপত্তা টিপস',
      tipExits: 'আপনার বের হওয়ার পথ জানুন',
      tipExitsDesc: 'আপনার ঘর থেকে নিকটতম জরুরি বের হওয়ার পথ খুঁজুন।',
      tipKey: 'আপনার কী কার্ড হাতের কাছে রাখুন',
      tipKeyDesc: 'ঘর থেকে বের হওয়ার সময় সবসময় রুম কী সাথে রাখুন।',
      tipApp: 'এই অ্যাপ খোলা রাখুন',
      tipAppDesc: 'তাৎক্ষণিক জরুরি সতর্কতা পেতে বিজ্ঞপ্তি সক্ষম করুন।',
      tipElevator: 'জরুরি অবস্থায় লিফট ব্যবহার করবেন না',
      tipElevatorDesc: 'আগুন বা উচ্ছেদের সময় সবসময় সিঁড়ি ব্যবহার করুন।',
      simulateAlert: 'সতর্কতা সিমুলেট করুন',
    },

    report: {
      title: 'সমস্যা রিপোর্ট করুন',
      subtitle: 'রিপোর্ট করতে সমস্যার ধরন নির্বাচন করুন',
      fire: 'আগুন / ধোঁয়া',
      fireDesc: 'আমি আগুন দেখতে পাচ্ছি বা ধোঁয়ার গন্ধ পাচ্ছি',
      medical: 'চিকিৎসা',
      medicalDesc: 'কারো চিকিৎসা সাহায্য দরকার',
      safety: 'নিরাপত্তা উদ্বেগ',
      safetyDesc: 'আমি অনিরাপদ অনুভব করছি বা একটি হুমকি দেখতে পাচ্ছি',
      assistance: 'সহায়তা',
      assistanceDesc: 'আমার সাহায্য বা সহায়তা দরকার',
      confirmTitle: 'আপনি কি নিশ্চিত যে এই সমস্যাটি রিপোর্ট করতে চান? আপনার অবস্থান এবং সেশন তথ্য শেয়ার করা হবে।',
      confirmSend: 'নিশ্চিত করুন ও পাঠান',
      successTitle: 'রিপোর্ট পাঠানো হয়েছে',
      successDesc: 'আপনার রিপোর্ট জমা দেওয়া হয়েছে। সাহায্য আসছে।',
      privacyNote: 'আপনার পরিচয় বেনামী থাকে। রিপোর্টের সময় শুধুমাত্র আপনার সেশন আইডি এবং অবস্থান শেয়ার করা হয়।',
    },

    settings: {
      title: 'সেটিংস',
      subtitle: 'আপনার নিরাপত্তা পছন্দ কনফিগার করুন',
      sessionInfo: 'সেশন তথ্য',
      sessionId: 'সেশন আইডি',
      property: 'সম্পত্তি',
      propertyId: 'সম্পত্তি আইডি',
      roomNumber: 'ঘর নম্বর',
      roomPlaceholder: 'আপনার ঘর নম্বর দিন (ঐচ্ছিক)',
      roomHint: 'জরুরি অবস্থায় উদ্ধারকারীদের আপনাকে দ্রুত খুঁজে পেতে সাহায্য করে।',
      language: 'ভাষা',
      location: 'অবস্থান',
      gpsStatus: 'GPS অবস্থা',
      gpsAvailable: 'উপলব্ধ',
      gpsUnavailable: 'অনুপলব্ধ',
      locationSharing: 'অবস্থান শেয়ারিং',
      sharingActive: 'সক্রিয়',
      sharingInactive: 'নিষ্ক্রিয়',
      locationHint: 'শুধুমাত্র সক্রিয় SOS বা জরুরি ইভেন্টের সময় অবস্থান শেয়ার করা হয়।',
      privacyTitle: 'গোপনীয়তা নোটিশ',
      privacyDesc: 'আপনার পরিচয় বেনামী। অবস্থান ডেটা শুধুমাত্র সক্রিয় নিরাপত্তা ইভেন্টে বা আপনি SOS পাঠালে প্রেরিত হয়।',
    },

    alert: {
      sendSOS: 'SOS পাঠান',
      seeInstructions: 'নির্দেশনা দেখুন',
      iAmSafe: 'আমি নিরাপদ',
      issuedAt: 'জারি করা হয়েছে',
    },

    emergency: {
      fire: 'আগুন সতর্কতা',
      evacuation: 'উচ্ছেদ',
      medical: 'চিকিৎসা সতর্কতা',
      lockdown: 'নিরাপত্তা লকডাউন',
      weather: 'তীব্র আবহাওয়া',
    },

    sos: {
      title: 'সংকট সংকেত পাঠান',
      howAreYou: 'আপনি এখন কেমন আছেন?',
      tapToSend: 'পাঠাতে ট্যাপ করুন',
      helpRequested: 'সাহায্যের অনুরোধ করা হয়েছে',
      helpDesc: 'শান্ত থাকুন। আপনার অবস্থান এবং অবস্থা শেয়ার করা হয়েছে।',
      imSafeNow: 'আমি এখন নিরাপদ',
      cancelSOS: 'SOS বাতিল',
      locationWarn: 'অবস্থান অনুপলব্ধ। SOS স্থানাঙ্ক ছাড়াই পাঠানো হবে।',
    },

    status: {
      safe: 'আমি নিরাপদ',
      need_help: 'সাহায্য দরকার',
      unable_to_move: 'নড়তে পারছি না',
      evacuating: 'সরে যাচ্ছি',
    },

    guidance: {
      title: 'নিরাপত্তা নির্দেশনা',
      followSteps: 'এই ধাপগুলি অনুসরণ করুন',
      stepsCompleted: '{{done}} / {{total}} ধাপ সম্পূর্ণ',
      needHelp: 'তাৎক্ষণিক সাহায্য দরকার? SOS পাঠান →',
    },

    resolved: {
      allClear: 'সব ঠিক আছে',
      emergencyResolved: 'জরুরি অবস্থা সমাধান হয়েছে',
      message: 'জরুরি অবস্থা সমাধান হয়েছে। আপনি নিরাপদ। নিরাপত্তা নির্দেশনা অনুসরণ করার জন্য ধন্যবাদ।',
      resolvedAt: 'সমাধান সময়',
      session: 'সেশন',
      sosSent: 'SOS সংকেত পাঠানো হয়েছে',
      returnHome: 'হোমে ফিরুন',
      locationStopped: 'অবস্থান শেয়ারিং বন্ধ করা হয়েছে। আপনার সেশন সক্রিয় আছে।',
    },

    locationIndicator: {
      sharing: 'অবস্থান শেয়ারিং সক্রিয়',
    },
  },
};

export default bn;
