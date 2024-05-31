import { mockedTimelineActivities } from '~/testing/mock-data/timeline-activities';

import { groupEventsByMonth } from '../groupEventsByMonth';

describe('groupEventsByMonth', () => {
  it('should group activities by month', () => {
    const grouped = groupEventsByMonth(mockedTimelineActivities);

    expect(grouped).toHaveLength(2);
    expect(grouped[0].items).toHaveLength(1);
    expect(grouped[1].items).toHaveLength(1);

    expect(grouped[0].year).toBe(new Date().getFullYear());
    expect(grouped[1].year).toBe(2023);

    expect(grouped[0].month).toBe(new Date().getMonth());
    expect(grouped[1].month).toBe(3);
  });
});
