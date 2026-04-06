const fs = require('fs');
const files = ['bn', 'gu', 'kn', 'ml', 'mr', 'or', 'pa', 'ta', 'te'];
const titles = {
  bn: 'জরুরী সাহায্যের আবেদন',
  gu: 'તાત્કાલિક મદદ માંગવી',
  kn: 'ತುರ್ತು ಸಹಾಯ ಕೇಳಲಾಗುತ್ತಿದೆ',
  ml: 'അടിയന്തര സഹായം ചോദിക്കുന്നു',
  mr: 'तात्काळ मदत मागत आहे',
  or: 'ତୁରନ୍ତ ସାହାଯ୍ୟ ମାଗୁଛି',
  pa: 'ਤੁਰੰਤ ਮਦਦ ਮੰਗਣਾ',
  ta: 'உடனடி உதவி கேட்கிறேன்',
  te: 'తక్షణ సహాయం కోసం అడుగుతోంది'
};
files.forEach(f => {
  let content = fs.readFileSync('src/i18n/' + f + '.ts', 'utf8');
  content = content.replace(/(sos\s*:\s*\{[^}]*?)title\s*:\s*['"].*?['"]/m, '$1title: \'' + titles[f] + '\'');
  fs.writeFileSync('src/i18n/' + f + '.ts', content);
});
console.log('done');
