import { ScheduleLabelValueConverter } from 'au/value-converters/schedule-label';
import PostingSchedule, { IPostingSchedule, ScheduleLabel } from 'lib/model/PostingSchedule';
import { ScheduleRenderer } from 'lib/view/ScheduleRenderer';

jest.mock('lib/view/ScheduleRenderer');

test('should render schedule label', () => {
  const when = new Date(2021, 12, 20, 11, 34, 27);
  const scheduleRenderer = new ScheduleRenderer(null, null, null);
  const renderLabelFn = jest.fn((schedule: IPostingSchedule) => schedule.label);
  scheduleRenderer.renderLabel = renderLabelFn;
  const converter = new ScheduleLabelValueConverter(scheduleRenderer);
  const actual = converter.toView(PostingSchedule.createNew().fromLabel(ScheduleLabel.nthMonthNthWeek, when, 2, 3));
  expect(renderLabelFn).toHaveBeenCalledTimes(1);
  expect(actual).toEqual(ScheduleLabel.nthMonthNthWeek);
});
