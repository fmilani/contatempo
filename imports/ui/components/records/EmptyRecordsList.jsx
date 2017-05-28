import React from 'react';
import { i18n } from 'meteor/universe:i18n';
import ImageTimer from 'material-ui/svg-icons/image/timer';

const grey500 = '#9E9E9E'; // TODO: use palette (grey500)

const EmptyRecordsList = () => (
  <div
    style={{
      margin: '40px 0px',
      textAlign: 'center',
      color: grey500,
      fontFamily: 'Roboto, sans-serif',
    }}
  >
    <div style={{ marginBottom: '20px' }}>
      {i18n.getTranslation('records.none')}
    </div>
    <ImageTimer style={{ width: '96px', height: '96px' }} color={grey500} />
  </div>
);

export default EmptyRecordsList;
