require('mocha');
import * as appInsights from 'applicationinsights';

before(() => {
  appInsights.setup('00000000-0000-0000-0000-000000000000');
  appInsights.defaultClient.config.disableAppInsights = true;
});
