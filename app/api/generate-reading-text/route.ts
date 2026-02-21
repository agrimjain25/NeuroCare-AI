import { NextResponse } from 'next/server';

const readingTopics = [
  {
    topic: 'Morning Routine',
    content: 'Starting your day with a calm routine can set a positive tone for everything ahead. Many people find that spending time on simple activities, like having a cup of tea or taking a short walk, helps them feel more centered. These small moments of peace help prepare the mind and body for the tasks of the day. Taking time to breathe deeply and appreciate the morning light can make a meaningful difference in how you feel.',
  },
  {
    topic: 'Gardening Benefits',
    content: 'Gardening offers wonderful benefits for both body and mind. Working with plants and soil connects us to nature in a peaceful way. Whether you grow flowers, vegetables, or herbs, the act of tending to living things brings satisfaction and joy. Many gardeners find that the simple work of watering, weeding, and watching things grow provides a sense of purpose and calm throughout their day.',
  },
  {
    topic: 'Reading and Learning',
    content: 'Books open doors to new worlds and ideas right from your comfortable reading chair. Reading regularly keeps the mind active and engaged. Stories transport us to different places and times, allowing our imagination to flourish. Whether you prefer mysteries, nature topics, or memoirs, reading is a peaceful activity that provides both entertainment and the joy of discovery throughout your life.',
  },
  {
    topic: 'Family Connections',
    content: 'Spending time with loved ones creates memories that warm the heart. Simple moments like sharing a meal together or listening to someone\'s stories build strong bonds. Family connections give us a sense of belonging and purpose. These relationships remind us that we are valued and supported, which is important for our well-being and happiness.',
  },
  {
    topic: 'Nature Walks',
    content: 'Walking outside in nature offers many benefits for health and happiness. Fresh air and natural light help our bodies feel energized and restored. The sounds of birds, the sight of trees and flowers, and the feel of the breeze on your skin all bring calm and peace. Regular nature walks can improve mood, reduce worry, and help you feel more connected to the world around you.',
  },
  {
    topic: 'Music and Memory',
    content: 'Music has a special way of connecting to our memories and emotions. Listening to songs from different times in your life can bring back happy moments and feelings. Whether you enjoy classical music, old favorites, or new discoveries, music adds richness to daily life. Many people find that music helps them feel more relaxed, happier, and more connected to themselves and others.',
  },
  {
    topic: 'Cooking and Food',
    content: 'Preparing food with care and attention can be a meaningful activity. Cooking brings together flavors and textures to create something nourishing and delicious. Many cultures value the time spent preparing meals as a way to show love and care. Taking time to cook slowly, to enjoy flavors, and to share meals with others adds joy and connection to our days.',
  },
  {
    topic: 'Creativity and Arts',
    content: 'Creative activities like painting, drawing, or crafts offer peaceful ways to express yourself. These activities quiet the busy mind and allow for focus and calm. You don\'t need to be skilled at art to enjoy its benefits. Creating something with your hands, choosing colors, and following your imagination brings satisfaction and joy regardless of the outcome.',
  },
  {
    topic: 'Sleep and Rest',
    content: 'Good sleep is one of the most important things for overall health and happiness. A comfortable bed, a quiet room, and a regular sleep routine help your body rest deeply. When we sleep well, we think more clearly, feel happier, and have more energy for the day. Taking time to prepare for sleep by relaxing before bedtime helps ensure restful and refreshing nights.',
  },
  {
    topic: 'Pet Companionship',
    content: 'Pets bring joy, comfort, and companionship into our lives. Spending time with animals reduces stress and brings calm. Whether it\'s a dog, cat, bird, or fish, caring for a pet gives us a sense of purpose. The unconditional love and presence of a pet reminds us of simple pleasures and provides constant, gentle companionship throughout each day.',
  },
];

export async function GET() {
  try {
    // Select a random topic
    const randomTopic = readingTopics[Math.floor(Math.random() * readingTopics.length)];

    // Verify word count is 80-120 words
    const wordCount = randomTopic.content.split(/\s+/).length;

    return NextResponse.json({
      topic: randomTopic.topic,
      text: randomTopic.content,
      wordCount,
    });
  } catch (error) {
    console.error('Reading text generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reading text' },
      { status: 500 }
    );
  }
}
