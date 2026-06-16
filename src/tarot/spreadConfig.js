// layout: array of [row, col] positions (1-based) for each card in order
export const SPREADS = [
  {
    id: 'single',
    label: 'Single Card',
    positions: ['Card of the Moment'],
    gridCols: 1,
    gridRows: 1,
    layout: [[1, 1]]
  },
  {
    id: 'three-card',
    label: 'Three Card',
    positions: ['Past', 'Present', 'Future'],
    gridCols: 3,
    gridRows: 1,
    layout: [[1, 1], [1, 2], [1, 3]]
  },
  {
    id: 'five-card',
    label: 'Five Card',
    // cross shape: Present in center, others around it
    positions: ['Past', 'Present', 'Future', 'Advice', 'Outcome'],
    gridCols: 3,
    gridRows: 3,
    layout: [
      [2, 1], // Past
      [2, 2], // Present
      [2, 3], // Future
      [3, 2], // Advice
      [1, 2]  // Outcome
    ]
  },
  {
    id: 'celtic-cross',
    label: 'Celtic Cross',
    // Classic cross (cols 1-3) + staff column (col 4)
    positions: [
      'Present',
      'Challenge',
      'Foundation',
      'Recent Past',
      'Possible Outcome',
      'Near Future',
      'Your Attitude',
      'External Influences',
      'Hopes & Fears',
      'Final Outcome'
    ],
    gridCols: 4,
    gridRows: 4,
    layout: [
      [2, 2], // Present
      [3, 2], // Challenge
      [4, 2], // Foundation
      [2, 1], // Recent Past
      [1, 2], // Possible Outcome
      [2, 3], // Near Future
      [1, 4], // Your Attitude
      [2, 4], // External Influences
      [3, 4], // Hopes & Fears
      [4, 4]  // Final Outcome
    ]
  }
]
