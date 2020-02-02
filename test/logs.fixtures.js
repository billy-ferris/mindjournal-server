function makeLogsArray() {
  return [
    {
      id: 1,
      content: 'Having an alright day',
      mood: 'Neutral',
      created_at: '2020-01-09T08:17:24.547Z',
      user_id: 1
    },
    {
      id: 2,
      content: 'Work did not go so well',
      mood: 'Angry',
      created_at: '2020-01-09T08:17:24.547Z',
      user_id: 1
    },
    {
      id: 3,
      content: 'Had an AMAZING date today',
      mood: 'Very Good',
      created_at: '2020-01-09T08:17:24.547Z',
      user_id: 1
    },
    {
      id: 4,
      content: 'Today was a good day',
      mood: 'Good',
      created_at: '2020-01-09T13:17:24.547Z',
      user_id: 1
    }
  ];
}

module.exports = {
  makeLogsArray
};
