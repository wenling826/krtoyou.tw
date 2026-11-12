const assert=require('node:assert/strict');
const {deliveryTextLength,compactDriverRequest}=require('../delivery-output.js');
assert.equal(deliveryTextLength('가 나.'),4);
assert.equal(deliveryTextLength('😀'),1);
for(const type of ['front','door','table','doorFront','homeDoor','commonDoor','firstEntrance','homeCommon']){
 const text=compactDriverRequest(type,'1203호','','','');
 assert(deliveryTextLength(text)<=50,`${type}: ${text.length}`);
 assert(text.includes('사진'));
}
const custom='가'.repeat(60);
assert(compactDriverRequest('custom','',custom,'','').includes(custom),'Long instructions must not be silently truncated');
assert(deliveryTextLength(compactDriverRequest('custom','',custom,'',''))>50);
assert(compactDriverRequest('door','1203호','', '문자 주세요.','Kim').includes('Kim'));
console.log('Driver presets fit 50 characters; spaces, Unicode, custom text and recipient preservation passed.');
