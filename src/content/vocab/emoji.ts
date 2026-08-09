/**
 * Hình minh họa bằng emoji cho thẻ từ vựng (MM-05).
 *
 * Vì sao để riêng thay vì thêm trường vào từng thẻ trong `index.ts`: chỉ
 * những từ CỤ THỂ (danh từ đếm được, con vật, đồ vật, hoạt động) mới có
 * emoji diễn đạt đúng nghĩa — các từ trừu tượng (`personality`,
 * `sustainable`, `figure out`...) mà gán emoji bừa sẽ gây hiểu sai nghĩa,
 * còn hại hơn là không có hình. Tách bảng tra riêng giúp thấy ngay từ nào
 * đã có hình, từ nào cố tình bỏ trống, và bổ sung dần không phải động vào
 * 420 dòng dữ liệu từ vựng.
 *
 * Khóa là `word` viết thường, đúng như trong VocabCard.
 */
export const VOCAB_EMOJI: Record<string, string> = {
  // TV-01 · Gia đình & bản thân
  father: '👨', mother: '👩', brother: '👦', sister: '👧',
  grandparents: '👴👵', cousin: '🧑‍🤝‍🧑', parents: '👨‍👩‍👦', baby: '👶',
  family: '👨‍👩‍👧‍👦', name: '📛', birthday: '🎂', twin: '👯',
  married: '💍', household: '🏡', polite: '🙇', generous: '🎁',

  // TV-02 · Trường lớp & học tập
  classroom: '🏫', teacher: '🧑‍🏫', student: '🧑‍🎓', homework: '📝',
  timetable: '🗓️', exam: '📄', library: '📚', playground: '🛝',
  uniform: '👔', blackboard: '📋', score: '💯', dictionary: '📖',
  schoolbag: '🎒', stationery: '✏️', grade: '🅰️', 'take notes': '🖊️',

  // TV-03 · Nhà cửa & đồ vật
  house: '🏠', room: '🚪', kitchen: '🍳', bedroom: '🛏️',
  bathroom: '🛁', table: '🪑', chair: '🪑', bed: '🛏️',
  window: '🪟', door: '🚪', lamp: '💡', mirror: '🪞',
  wardrobe: '🧥', garden: '🌷', 'living room': '🛋️', shelf: '🗄️',
  sofa: '🛋️', roof: '🏘️', staircase: '🪜', curtain: '🪟',
  fence: '🚧', cozy: '🕯️',

  // TV-04 · Đồ ăn & thức uống
  rice: '🍚', bread: '🍞', vegetable: '🥦', fruit: '🍎',
  meat: '🥩', fish: '🐟', egg: '🥚', milk: '🥛',
  juice: '🧃', noodles: '🍜', snack: '🍪', sweet: '🍬',
  hungry: '😋', thirsty: '🥤', recipe: '📜', dessert: '🍰',
  spicy: '🌶️', boil: '🥘', fry: '🍳', steam: '♨️',

  // TV-05 · Động vật & thiên nhiên
  dog: '🐶', cat: '🐱', bird: '🐦', elephant: '🐘',
  tiger: '🐯', monkey: '🐵', forest: '🌲', mountain: '⛰️',
  river: '🏞️', tree: '🌳', flower: '🌸', sky: '☁️',
  insect: '🐞', feather: '🪶', paw: '🐾', rabbit: '🐰',
  snake: '🐍', bear: '🐻', deer: '🦌', ocean: '🌊',
  desert: '🏜️', valley: '🏞️', nest: '🪹',

  // TV-06 · Thời tiết & mùa
  sunny: '☀️', rainy: '🌧️', cloudy: '☁️', windy: '💨',
  hot: '🥵', cold: '🥶', warm: '🌤️', cool: '😎',
  storm: '⛈️', spring: '🌱', summer: '🏖️', autumn: '🍂',
  winter: '❄️', temperature: '🌡️', 'weather forecast': '📺',
  foggy: '🌫️', freezing: '🧊', thunder: '⚡', degree: '🌡️',
  flood: '🌊', lightning: '🌩️', shower: '🌦️', drizzle: '🌦️',

  // TV-07 · Thể thao & sở thích
  football: '⚽', basketball: '🏀', swim: '🏊', team: '🧑‍🤝‍🧑',
  match: '🆚', goal: '🥅', player: '🏃', practice: '🔁',
  hobby: '🎨', race: '🏁', champion: '🏆', exercise: '💪',
  coach: '📣', medal: '🥇', stadium: '🏟️', referee: '🧑‍⚖️',
  gymnastics: '🤸', cycling: '🚴', athlete: '🏅', victory: '🎉',

  // TV-08 · Nghề nghiệp
  doctor: '🧑‍⚕️', farmer: '🧑‍🌾', engineer: '🧑‍🔧', nurse: '👩‍⚕️',
  pilot: '🧑‍✈️', driver: '🚗', singer: '🎤', writer: '✍️',
  'police officer': '👮', firefighter: '🧑‍🚒', chef: '🧑‍🍳', dentist: '🦷',
  scientist: '🔬', salary: '💵', journalist: '📰', photographer: '📷',
  lawyer: '⚖️', architect: '📐', accountant: '🧮', shopkeeper: '🏪',
  tailor: '🧵', electrician: '🔌', librarian: '📚', vet: '🐕‍🦺',

  // TV-09 · Thành phố & phương tiện
  city: '🏙️', street: '🛣️', bus: '🚌', bicycle: '🚲',
  car: '🚗', train: '🚆', airport: '✈️', 'traffic light': '🚦',
  left: '⬅️', right: '➡️', straight: '⬆️', map: '🗺️',
  crowded: '🧍🧍🧍', corner: '📐', crossroads: '🛑', journey: '🧳',
  signpost: '🪧', motorbike: '🏍️', subway: '🚇', pedestrian: '🚶',
  bridge: '🌉', countryside: '🌾', 'traffic jam': '🚗🚗',

  // TV-10 · Cơ thể & sức khỏe
  head: '🧠', eye: '👁️', ear: '👂', hand: '✋',
  leg: '🦵', stomach: '🫃', healthy: '💚', sick: '🤒',
  fever: '🤒', cough: '😷', medicine: '💊', rest: '😴',
  hospital: '🏥', injury: '🩹', toothache: '🦷', dizzy: '😵',
  bandage: '🩹', mouth: '👄', nose: '👃', shoulder: '💪',
  bone: '🦴', sneeze: '🤧', headache: '🤕', checkup: '🩺',

  // TV-11 · Lễ hội & truyền thống
  'Tet holiday': '🧧', christmas: '🎄', festival: '🎊', lantern: '🏮',
  fireworks: '🎆', tradition: '📿', celebrate: '🎉', gift: '🎁',
  costume: '🎭', parade: '🥁', 'New Year': '🎆', 'lucky money': '🧧',
  decorate: '✨', mooncake: '🥮', guest: '🙋', easter: '🐣',
  halloween: '🎃', anniversary: '📅', incense: '🕯️', ceremony: '🎗️',

  // TV-12 · Công nghệ
  computer: '💻', smartphone: '📱', internet: '🌐', website: '🔗',
  email: '📧', message: '💬', 'video call': '📹', robot: '🤖',
  camera: '📷', television: '📺', password: '🔒', download: '⬇️',
  screen: '🖥️', device: '📲', upload: '⬆️', keyboard: '⌨️',
  application: '📱', 'social media': '💬', printer: '🖨️', file: '📁',
  wireless: '📶', online: '🟢', 'artificial intelligence': '🤖',

  // TV-13 · Môi trường
  environment: '🌍', pollution: '🏭', rubbish: '🗑️', recycle: '♻️',
  'plastic bag': '🛍️', clean: '🧼', dirty: '🦠', 'plant a tree': '🌳',
  'save water': '💧', 'save energy': '🔋', climate: '🌡️', earth: '🌏',
  wildlife: '🦁', 'global warming': '🔥', reduce: '📉', reuse: '🔄',
  litter: '🚮', 'solar energy': '☀️', deforestation: '🪓', extinct: '🦖',
  compost: '🍂', 'eco-friendly': '🌿', renewable: '🔋',

  // TV-14 · Cụm động từ & thành ngữ (chỉ những cụm hình dung được)
  'get up': '⏰', 'turn on': '🔛', 'turn off': '🔕', 'look for': '🔍',
  'put on': '👕', 'take off': '🧦', 'write down': '📝', 'pick up': '🤲',
  'hand in': '📤', 'piece of cake': '🍰', 'give up': '🏳️', 'grow up': '📈',
  'as easy as pie': '🥧', 'cheer up': '😄', 'hang out': '🧑‍🤝‍🧑',
  'hit the books': '📚', 'under the weather': '🤧', 'call back': '📞',
}

export function emojiForWord(word: string): string | undefined {
  return VOCAB_EMOJI[word] ?? VOCAB_EMOJI[word.toLowerCase()]
}
