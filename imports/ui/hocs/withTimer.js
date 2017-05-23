import { compose, withHandlers, withState } from 'recompose';
import moment from 'moment';

/**
 * Higher order component that gives a 'now' prop that indicates the current
 * time, a handler to keep udpating it and a handler to stop the update.
 */
const withTimer = compose(
  withState('now', 'updateNow', null),
  withState('timer', 'updateTimer', null),
  withHandlers({
    startTimer: ({ updateNow, updateTimer }) => () => {
      updateNow(moment());
      updateTimer(setInterval(() => updateNow(moment()), 33));
    },
    stopTimer: ({ timer }) => () => {
      if (timer) {
        clearInterval(timer);
      }
    },
  }),
);

export default withTimer;
