import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import IngestionMenu from './IngestionMenu';
import inject18n from '../../../components/i18n';
import { QueryRenderer } from '../../../relay/environment';
import WorkersStatus, { workersStatusQuery } from './connectors/WorkersStatus';
import ConnectorsStatus, { connectorsStatusQuery } from './connectors/ConnectorsStatus';
import Loader from '../../../components/Loader';
import Breadcrumbs from '../../../components/Breadcrumbs';
import useConnectedDocumentModifier from '../../../utils/hooks/useConnectedDocumentModifier';

const styles = () => ({
  container: {
    padding: '0 200px 50px 0',
  },
});

const Connectors = () => {
  const { t_i18n } = useFormatter();
  const { setTitle } = useConnectedDocumentModifier();
  setTitle(t_i18n('Ingestion: Connectors | Data'));
  const renderLines = () => {
    const { t, classes } = this.props;
    return (
      <div className={classes.container}>
        <Breadcrumbs variant="list" elements={[{ label: t('Data') }, { label: t('Ingestion') }, { label: t('Connectors'), current: true }]} />
        <IngestionMenu/>
        <QueryRenderer
          query={workersStatusQuery}
          render={({ props }) => {
            if (props) {
              return <WorkersStatus data={props} />;
            }
            return <div> &nbsp; </div>;
          }}
        />
        <QueryRenderer
          query={connectorsStatusQuery}
          render={({ props }) => {
            if (props) {
              return <ConnectorsStatus data={props} />;
            }
            return <Loader />;
          }}
        />
      </div>
    );
  };
};

Connectors.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  connectorsStatus: PropTypes.array,
};

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(Connectors);
