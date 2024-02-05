import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withRouter } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import MoreVert from '@mui/icons-material/MoreVert';
import { graphql } from 'react-relay';
import StixCoreObjectEnrichment from '../../common/stix_core_objects/StixCoreObjectEnrichment';
import inject18n from '../../../../components/i18n';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import { indicatorEditionQuery } from './IndicatorEdition';
import IndicatorEditionContainer from './IndicatorEditionContainer';
import { KnowledgeSecurity } from '../../../../utils/Security';
import { KNOWLEDGE_KNUPDATE, KNOWLEDGE_KNENRICHMENT, KNOWLEDGE_KNUPDATE_KNDELETE } from '../../../../utils/hooks/useGranted';
import Transition from '../../../../components/Transition';

const IndicatorPopoverDeletionMutation = graphql`
  mutation IndicatorPopoverDeletionMutation($id: ID!) {
    indicatorDelete(id: $id)
  }
`;

class IndicatorPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      displayDelete: false,
      displayEdit: false,
      displayEnrichment: false,
      deleting: false,
    };
  }

  handleOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenDelete() {
    this.setState({ displayDelete: true });
    this.handleClose();
  }

  handleCloseDelete() {
    this.setState({ displayDelete: false });
  }

  submitDelete() {
    this.setState({ deleting: true });
    commitMutation({
      mutation: IndicatorPopoverDeletionMutation,
      variables: {
        id: this.props.id,
      },
      onCompleted: () => {
        this.setState({ deleting: false });
        this.handleClose();
        this.props.history.push('/dashboard/observations/indicators');
      },
    });
  }

  handleOpenEdit() {
    this.setState({ displayEdit: true });
    this.handleClose();
  }

  handleCloseEdit() {
    this.setState({ displayEdit: false });
  }

  handleOpenEnrichment() {
    this.setState({ displayEnrichment: true });
    this.handleClose();
  }

  handleCloseEnrichment() {
    this.setState({ displayEnrichment: false });
  }

  render() {
    const { t, id } = this.props;
    return (
      <KnowledgeSecurity
        needs={[KNOWLEDGE_KNUPDATE, KNOWLEDGE_KNUPDATE_KNDELETE]}
        entity='Indicator'
      >
        <>
          <ToggleButton
            value="popover"
            size="small"

            onClick={this.handleOpen.bind(this)}
          >
            <MoreVert fontSize="small" color="primary" />
          </ToggleButton>
          <Menu
            anchorEl={this.state.anchorEl}
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleClose.bind(this)}
          >
            <KnowledgeSecurity needs={[KNOWLEDGE_KNUPDATE]} entity='Indicator'>
              <MenuItem onClick={this.handleOpenEdit.bind(this)}>
                {t('Update')}
              </MenuItem>
            </KnowledgeSecurity>
            <KnowledgeSecurity needs={[KNOWLEDGE_KNENRICHMENT]} entity='Indicator'>
              <MenuItem onClick={this.handleOpenEnrichment.bind(this)}>
                {t('Enrich')}
              </MenuItem>
            </KnowledgeSecurity>
            <KnowledgeSecurity needs={[KNOWLEDGE_KNUPDATE_KNDELETE]} entity='Indicator'>
              <MenuItem onClick={this.handleOpenDelete.bind(this)}>
                {t('Delete')}
              </MenuItem>
            </KnowledgeSecurity>
          </Menu>
          <StixCoreObjectEnrichment stixCoreObjectId={id} open={this.state.displayEnrichment} handleClose={this.handleCloseEnrichment.bind(this)} />
          <Dialog
            open={this.state.displayDelete}
            PaperProps={{ elevation: 1 }}
            keepMounted={true}
            TransitionComponent={Transition}
            onClose={this.handleCloseDelete.bind(this)}
          >
            <DialogContent>
              <DialogContentText>
                {t('Do you want to delete this indicator?')}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.handleCloseDelete.bind(this)}
                disabled={this.state.deleting}
              >
                {t('Cancel')}
              </Button>
              <Button
                color="secondary"
                onClick={this.submitDelete.bind(this)}
                disabled={this.state.deleting}
              >
                {t('Delete')}
              </Button>
            </DialogActions>
          </Dialog>
          <QueryRenderer
            query={indicatorEditionQuery}
            variables={{ id }}
            render={({ props }) => {
              if (props) {
                return (
                  <IndicatorEditionContainer
                    indicator={props.indicator}
                    handleClose={this.handleCloseEdit.bind(this)}
                    open={this.state.displayEdit}
                  />
                );
              }
              return <div />;
            }}
          />
        </>
      </KnowledgeSecurity>
    );
  }
}

IndicatorPopover.propTypes = {
  id: PropTypes.string,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(inject18n, withRouter)(IndicatorPopover);
