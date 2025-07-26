import { Scripture } from '../types';

export const SCRIPTURES: Scripture[] = [
  {
    id: '1',
    verse: "She is clothed with strength and dignity; she can laugh at the days to come.",
    reference: "Proverbs 31:25",
    theme: 'strength',
    length: 'medium'
  },
  {
    id: '2', 
    verse: "For I know the plans I have for you, plans to prosper you and not to harm you, to give you hope and a future.",
    reference: "Jeremiah 29:11",
    theme: 'encouragement',
    length: 'long'
  },
  {
    id: '3',
    verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9",
    theme: 'strength',
    length: 'long'
  },
  {
    id: '4',
    verse: "Peace I leave with you; my peace I give you.",
    reference: "John 14:27",
    theme: 'peace',
    length: 'short'
  },
  {
    id: '5',
    verse: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7",
    theme: 'peace',
    length: 'short'
  },
  {
    id: '6',
    verse: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
    reference: "1 Corinthians 13:4",
    theme: 'love',
    length: 'medium'
  },
  {
    id: '7',
    verse: "Children are a heritage from the Lord, offspring a reward from him.",
    reference: "Psalm 127:3",
    theme: 'love',
    length: 'short'
  },
  {
    id: '8',
    verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
    reference: "Isaiah 40:31",
    theme: 'strength',
    length: 'medium'
  },
  {
    id: '9',
    verse: "Be patient, then, brothers and sisters, until the Lord's coming.",
    reference: "James 5:7",
    theme: 'patience',
    length: 'short'
  },
  {
    id: '10',
    verse: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.",
    reference: "Numbers 6:24-25",
    theme: 'encouragement',
    length: 'medium'
  },
  {
    id: '11',
    verse: "He gives strength to the weary and increases the power of the weak.",
    reference: "Isaiah 40:29",
    theme: 'strength',
    length: 'short'
  },
  {
    id: '12',
    verse: "And we know that in all things God works for the good of those who love him.",
    reference: "Romans 8:28",
    theme: 'encouragement',
    length: 'medium'
  },
  {
    id: '13',
    verse: "You are precious and honored in my sight, and because I love you.",
    reference: "Isaiah 43:4",
    theme: 'love',
    length: 'short'
  },
  {
    id: '14',
    verse: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you.",
    reference: "Zephaniah 3:17",
    theme: 'encouragement',
    length: 'medium'
  },
  {
    id: '15',
    verse: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28",
    theme: 'peace',
    length: 'medium'
  }
];

export const FEEDING_PRESETS = [
  { label: "15 min", value: 15 * 60 },
  { label: "30 min", value: 30 * 60 },
  { label: "45 min", value: 45 * 60 },
  { label: "1 hour", value: 60 * 60 }
];