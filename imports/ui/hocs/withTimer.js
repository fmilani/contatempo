import { compose, withHandlers, withState } from 'recompose';
import moment from 'moment';

/**
 * Higher order component that gives a 'now' prop that indicates the current
 * time, a handler to keep udpating it and a handler to stop the update.
 */
const withTimer = compose(
  withState('now', 'updateNow', moment().toDate()),
  withState('timer', 'updateTimer', null),
  withHandlers({
    startTimer: ({ timer, updateNow, updateTimer }) => () => {
      if (timer) {
        // we don't want to start a new timer if we already have
        // one running =)
        return;
      }
      updateNow(moment().toDate());
      updateTimer(setInterval(() => updateNow(moment().toDate()), 100));
    },
    stopTimer: ({ timer, updateTimer }) => () => {
      if (timer) {
        clearInterval(timer);
        updateTimer(null);
      }
    },
  }),
);

export default withTimer;
