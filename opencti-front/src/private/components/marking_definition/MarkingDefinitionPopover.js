import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withRouter } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import { commitMutation, QueryRenderer } from 'react-relay';
import { withStyles } from '@material-ui/core/styles/index';
import Drawer from '@material-ui/core/Drawer';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slide from '@material-ui/core/Slide';
import MoreVert from '@material-ui/icons/MoreVert';
import inject18n from '../../../components/i18n';
import environment from '../../../relay/environment';
import MarkingDefinitionEdition from './MarkingDefinitionEdition';

const styles = theme => ({
  container: {
    margin: 0,
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'auto',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const markingDefinitionPopoverDeletionMutation = graphql`
    mutation MarkingDefinitionPopoverDeletionMutation($id: ID!) {
        markingDefinitionEdit(id: $id) {
            delete
        }
    }
`;

const markingDefinitionEditionQuery = graphql`
    query MarkingDefinitionPopoverEditionQuery($id: String!) {
        markingDefinition(id: $id) {
            ...MarkingDefinitionEdition_markingDefinition
        }
        me {
            ...MarkingDefinitionEdition_me
        }
    }
`;

class MarkingDefinitionPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      displayUpdate: false,
      displayDelete: false,
      deleting: false,
    };
  }

  handleOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenUpdate() {
    this.setState({ displayUpdate: true });
    this.handleClose();
  }

  handleCloseUpdate() {
    this.setState({ displayUpdate: false });
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
    commitMutation(environment, {
      mutation: markingDefinitionPopoverDeletionMutation,
      variables: {
        id: this.props.markingDefinitionId,
      },
      updater: (store) => {
        console.log(store);
      },
      onCompleted: () => {
        this.setState({ deleting: false });
        this.handleCloseDelete();
      },
    });
  }

  render() {
    const { classes, t, markingDefinitionId } = this.props;
    return (
      <div className={classes.container}>
        <IconButton onClick={this.handleOpen.bind(this)} aria-haspopup='true'>
          <MoreVert/>
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem onClick={this.handleOpenUpdate.bind(this)}>{t('Update')}</MenuItem>
          <MenuItem onClick={this.handleOpenDelete.bind(this)}>{t('Delete')}</MenuItem>
        </Menu>
        <Drawer open={this.state.displayUpdate} anchor='right' classes={{ paper: classes.drawerPaper }} onClose={this.handleCloseUpdate.bind(this)}>
          <QueryRenderer
            environment={environment}
            query={markingDefinitionEditionQuery}
            variables={{ id: markingDefinitionId }}
            render={({ error, props }) => {
              if (error) { // Errors
                return <div> &nbsp; </div>;
              }
              if (props) { // Done
                return <MarkingDefinitionEdition me={props.me} markingDefinition={props.markingDefinition} handleClose={this.handleCloseUpdate.bind(this)}/>;
              }
              // Loading
              return <div> &nbsp; </div>;
            }}
          />
        </Drawer>
        <Dialog
          open={this.state.displayDelete}
          keepMounted={true}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this marking definition?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDelete.bind(this)} color="primary" disabled={this.state.deleting}>
              {t('Cancel')}
            </Button>
            <Button onClick={this.submitDelete.bind(this)} color="primary" disabled={this.state.deleting}>
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

MarkingDefinitionPopover.propTypes = {
  markingDefinitionId: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(MarkingDefinitionPopover);
