import { Scripture } from '../types';

// SCRIPTURES 陣列，包含中英文經文，繁體中文版本
export const SCRIPTURES: Scripture[] = [
  {
    id: '1',
    verse: "She is clothed with strength and dignity; she can laugh at the days to come.",
    reference: "Proverbs 31:25",
    verseChinese: "能力和威儀是她的衣服；她想到日後的景況就喜笑。",
    referenceChinese: "箴言 31:25",
    theme: 'strength',
    length: 'medium'
  },
  {
    id: '2', 
    verse: "For I know the plans I have for you, plans to prosper you and not to harm you, to give you hope and a future.",
    reference: "Jeremiah 29:11",
    verseChinese: "耶和華說：我知道我向你們所懷的意念是賜平安的意念，不是降災禍的意念，要叫你們末後有指望。",
    referenceChinese: "耶利米書 29:11",
    theme: 'encouragement',
    length: 'long'
  },
  {
    id: '3',
    verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9",
    verseChinese: "你當剛強壯膽！不要懼怕，也不要驚惶；因為你無論往哪裡去，耶和華你的神必與你同在。",
    referenceChinese: "約書亞記 1:9",
    theme: 'strength',
    length: 'long'
  },
  {
    id: '4',
    verse: "Peace I leave with you; my peace I give you.",
    reference: "John 14:27",
    verseChinese: "我留下平安給你們；我將我的平安賜給你們。",
    referenceChinese: "約翰福音 14:27",
    theme: 'peace',
    length: 'short'
  },
  {
    id: '5',
    verse: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7",
    verseChinese: "你們要將一切的憂慮卸給神，因為他顧念你們。",
    referenceChinese: "彼得前書 5:7",
    theme: 'peace',
    length: 'short'
  },
  {
    id: '6',
    verse: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
    reference: "1 Corinthians 13:4",
    verseChinese: "愛是恆久忍耐，又有恩慈；愛是不嫉妒，愛是不自誇，不張狂。",
    referenceChinese: "哥林多前書 13:4",
    theme: 'love',
    length: 'medium'
  },
  {
    id: '7',
    verse: "Children are a heritage from the Lord, offspring a reward from him.",
    reference: "Psalm 127:3",
    verseChinese: "兒女是耶和華所賜的產業，所懷的胎是他所給的賞賜。",
    referenceChinese: "詩篇 127:3",
    theme: 'love',
    length: 'short'
  },
  {
    id: '8',
    verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
    reference: "Isaiah 40:31",
    verseChinese: "但那等候耶和華的必重新得力。他們必如鷹展翅上騰。",
    referenceChinese: "以賽亞書 40:31",
    theme: 'strength',
    length: 'medium'
  },
  {
    id: '9',
    verse: "Be patient, then, brothers and sisters, until the Lord's coming.",
    reference: "James 5:7",
    verseChinese: "弟兄們哪，你們要忍耐，直到主來。",
    referenceChinese: "雅各書 5:7",
    theme: 'patience',
    length: 'short'
  },
  {
    id: '10',
    verse: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.",
    reference: "Numbers 6:24-25",
    verseChinese: "願耶和華賜福給你，保護你。願耶和華使他的臉光照你，賜恩給你。",
    referenceChinese: "民數記 6:24-25",
    theme: 'encouragement',
    length: 'medium'
  },
  {
    id: '11',
    verse: "He gives strength to the weary and increases the power of the weak.",
    reference: "Isaiah 40:29",
    verseChinese: "疲乏的，他賜能力；軟弱的，他加力量。",
    referenceChinese: "以賽亞書 40:29",
    theme: 'strength',
    length: 'short'
  },
  {
    id: '12',
    verse: "And we know that in all things God works for the good of those who love him.",
    reference: "Romans 8:28",
    verseChinese: "我們曉得萬事都互相效力，叫愛神的人得益處。",
    referenceChinese: "羅馬書 8:28",
    theme: 'encouragement',
    length: 'medium'
  },
  {
    id: '13',
    verse: "You are precious and honored in my sight, and because I love you.",
    reference: "Isaiah 43:4",
    verseChinese: "因我看你為寶為尊，又因我愛你。",
    referenceChinese: "以賽亞書 43:4",
    theme: 'love',
    length: 'short'
  },
  {
    id: '14',
    verse: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you.",
    reference: "Zephaniah 3:17",
    verseChinese: "耶和華你的神是施行拯救、大有能力的主！他在你中間必因你歡欣喜樂。",
    referenceChinese: "西番雅書 3:17",
    theme: 'encouragement',
    length: 'medium'
  },
  {
    id: '15',
    verse: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28",
    verseChinese: "凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。",
    referenceChinese: "馬太福音 11:28",
    theme: 'peace',
    length: 'medium'
  }
];

// FEEDING_PRESETS 陣列，餵奶預設時間
export const FEEDING_PRESETS = [
  { label: "15 min", value: 15 * 60 },
  { label: "30 min", value: 30 * 60 },
  { label: "45 min", value: 45 * 60 },
  { label: "1 hour", value: 60 * 60 }
];