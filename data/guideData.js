// backend/data/guideData.js

export const guideData = {
  wetWaste: {
    title: 'Wet Waste (Biodegradable)',
    items: [
      'Cooked and uncooked food',
      'Fruit and vegetable peels',
      'Egg shells, meat, and bones',
      'Tea leaves and coffee grounds',
      'Flowers and garden waste',
    ],
    binColor: 'Green',
  },
  dryWaste: {
    title: 'Dry Waste (Non-Biodegradable)',
    items: [
      'Paper, cardboard, newspapers',
      'Plastics, plastic bags, bottles, containers',
      'Metal cans, foil',
      'Glass bottles and jars',
      'Rubber, thermocol, textiles',
    ],
    binColor: 'Blue',
  },
  schedules: [
    {
      area: 'Vashi, Kopar Khairane, Ghansoli',
      collection: 'Wet waste collected daily. Dry waste collected on Tuesdays and Fridays.',
    },
    {
      area: 'Nerul, Seawoods, CBD Belapur',
      collection: 'Wet waste collected daily. Dry waste collected on Mondays and Thursdays.',
    },
    {
      area: 'Airoli, Sanpada, Juinagar',
      collection: 'Wet waste collected daily. Dry waste collected on Wednesdays and Saturdays.',
    },
  ],
};