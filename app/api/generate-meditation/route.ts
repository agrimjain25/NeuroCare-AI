import { NextResponse } from 'next/server';

const meditationStories = [
  {
    title: 'Peaceful Garden Walk',
    content: `Close your eyes and imagine yourself walking through a beautiful garden on a warm, gentle day. Feel the soft earth beneath your feet with each step. The sun warmly touches your skin. Around you, flowers of every color bloom gently in the breeze. Hear the soft sounds of birds singing their peaceful songs. Breathe in the sweet scent of flowers and fresh air. Your shoulders feel lighter with each breath. Continue walking slowly through this beautiful garden, taking in all the peaceful sights and sounds. Know that you are safe, calm, and at peace. With each breath, you feel more and more relaxed. Your mind is quiet and still.`,
  },
  {
    title: 'Seaside Calm',
    content: `Imagine yourself sitting on a quiet beach at sunset. Feel the warm sand beneath you, soft and comfortable. Listen to the gentle sound of waves lapping against the shore in a slow, rhythmic pattern. Breathe in the fresh ocean air. Feel the warm breeze on your face. The sky above you displays beautiful colors of orange, pink, and gold as the sun sets. Watch the waves roll in and out, in and out, creating a peaceful rhythm. Your whole body feels heavy and relaxed. Your mind becomes quiet with each wave. Let the sound of the ocean calm your spirit. You are safe, peaceful, and at rest.`,
  },
  {
    title: 'Forest Sanctuary',
    content: `You find yourself in a peaceful forest surrounded by tall, strong trees. Sunlight filters gently through the leaves above you, creating soft patterns of light and shadow. The air is cool and fresh. You hear the soft rustle of leaves and the quiet sounds of nature around you. Feel the peace that comes from being surrounded by nature. Your breathing becomes slow and deep. With each breath, you feel more and more peaceful. Notice the beauty of the trees, the plants, and all the living things around you. You are safe within this sanctuary. Your mind becomes calm and clear. Let yourself rest here in this peaceful place, knowing you can return whenever you need peace and quiet.`,
  },
  {
    title: 'Mountain Stillness',
    content: `Imagine yourself standing on a peaceful mountain at sunrise. The air is cool and fresh. Below you, clouds drift gently like a soft ocean. The sky above begins to fill with light and color. You feel stable and grounded on this high place. Your breathing becomes slow and steady. With each breath in, you breathe in peace. With each breath out, you release all worry and tension. The mountains around you stand quiet and strong, reminding you that you too are strong and safe. Feel the connection to the earth beneath you. Your mind becomes still and clear like the quiet morning air. Stay here as long as you wish, resting in this peaceful stillness.`,
  },
  {
    title: 'Meadow of Healing',
    content: `You walk into a beautiful meadow filled with wildflowers of every color. The grass beneath your feet is soft and welcoming. A gentle breeze carries the sweet scent of flowers. The sky above is a beautiful clear blue. Butterflies flutter softly around you. Hear the quiet hum of bees and the chirping of birds. Feel the warmth of the sun on your skin. Your whole body feels light and peaceful. Find a comfortable place in the meadow and lie down. The earth beneath you feels supportive and safe. With each breath, you feel more relaxed. Let the natural beauty around you heal your spirit and calm your mind.`,
  },
];

export async function GET() {
  try {
    // Select a random meditation story
    const randomStory = meditationStories[Math.floor(Math.random() * meditationStories.length)];

    return NextResponse.json({
      title: randomStory.title,
      content: randomStory.content,
      duration: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error('Meditation generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate meditation' },
      { status: 500 }
    );
  }
}
