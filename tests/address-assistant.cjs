const assert=require('node:assert/strict');
const {buildAddressPrompt,parseAddressResponse,naverAddressUrl}=require('../address-assistant.js');
for(const original of ['釜山鎮區釜田洞 1-2，範例大樓 1203 號房','釜山镇区 示例地址','123 Example-ro, Busan, Room 1203']){
  const prompt=buildAddressPrompt(original);
  assert(prompt.includes(JSON.stringify(original)));
  assert(prompt.includes('不可從 1203 房推測'));
}
const result=parseAddressResponse('```json\n'+JSON.stringify({koreanAddress:'부산광역시 부산진구 예시로 1',buildingName:'예시',room:'1203',floor:'',notes:'待核對',sources:['https://example.com']})+'\n```');
const plain=parseAddressResponse('地址：부산광역시 부산진구 예시로 1\n大樓：예시\n房號：1203\n樓層：\n說明：待核對\n來源：https://example.com');
assert.deepEqual(plain,result);
assert.equal(parseAddressResponse('地址：\n說明：有多個候選').address,'');
assert.equal(result.room,'1203');assert.equal(result.floor,'');
assert.equal(parseAddressResponse('{"jibunAddress":"부산진구 부전동 1-2"}').address,'부산진구 부전동 1-2');
assert.equal(parseAddressResponse('{"notes":"有多個候選"}').address,'');
for(const raw of ['null','[]','{"room":1203}','{"sources":[42]}','invalid'])assert.throws(()=>parseAddressResponse(raw));
const url=naverAddressUrl(result.address,result.building);
assert.equal(decodeURIComponent(url.split('/search/')[1]),result.address+' '+result.building);
assert(!url.includes('1203'));
console.log('Multilingual prompts, response validation, ambiguous results, room separation and NAVER search encoding passed.');
