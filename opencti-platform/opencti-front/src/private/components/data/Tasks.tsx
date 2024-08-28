import React from 'react';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import Alert from '@mui/material/Alert';
import { TasksLine_node$data } from '@components/cases/tasks/__generated__/TasksLine_node.graphql';
import { useFormatter } from '../../../components/i18n';
import { QueryRenderer } from '../../../relay/environment';
import TasksList, { tasksListQuery } from './tasks/TasksList';
import Loader, { LoaderVariant } from '../../../components/Loader';
import useAuth from '../../../utils/hooks/useAuth';
import { TASK_MANAGER } from '../../../utils/platformModulesHelper';
import ProcessingMenu from './ProcessingMenu';
import Breadcrumbs from '../../../components/Breadcrumbs';
import useConnectedDocumentModifier from '../../../utils/hooks/useConnectedDocumentModifier';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
  },
}));

const Tasks = () => {
  const { t_i18n } = useFormatter();
  const classes = useStyles();
  const { platformModuleHelpers } = useAuth();
  const { setTitle } = useConnectedDocumentModifier();
  setTitle(t_i18n('Processing: Tasks | Data'));
  const optionsInProgress = {
    count: 50,
    orderBy: 'created_at',
    orderMode: 'desc',
    includeAuthorities: true,
    filters: {
      mode: 'and',
      filters: [{ key: 'completed', values: ['false'] }],
      filterGroups: [],
    },
  };
  const optionsFinished = {
    count: 50,
    orderBy: 'created_at',
    orderMode: 'desc',
    includeAuthorities: true,
    filters: {
      mode: 'and',
      filters: [{ key: 'completed', values: ['true'] }],
      filterGroups: [],
    },
  };
  if (!platformModuleHelpers.isTasksManagerEnable()) {
    return (
      <div className={classes.container}>
        <Alert severity="info">
          {t_i18n(platformModuleHelpers.generateDisableMessage(TASK_MANAGER))}
        </Alert>
        <ProcessingMenu />
      </div>
    );
  }
  return (
    <div className={classes.container}
      data-testid='processing-tasks-page'
    >
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Data') }, { label: t_i18n('Processing') }, { label: t_i18n('Tasks'), current: true }]} />
      <ProcessingMenu />
      <Typography variant="h4" gutterBottom={true}>
        {t_i18n('In progress tasks')}
      </Typography>
      <QueryRenderer
        query={tasksListQuery}
        variables={optionsInProgress}
        render={({ props }: { props: TasksLine_node$data }) => {
          if (props) {
            return <TasksList data={props} />;
          }
          return <Loader variant={LoaderVariant.inElement}/>;
        }}
      />
      <Typography variant="h4" gutterBottom={true} style={{ marginTop: 35 }}>
        {t_i18n('Completed tasks')}
      </Typography>
      <QueryRenderer
        query={tasksListQuery}
        variables={optionsFinished}
        render={({ props }: { props: TasksLine_node$data }) => {
          if (props) {
            return <TasksList data={props} />;
          }
          return <Loader variant={LoaderVariant.inElement}/>;
        }}
      />
    </div>
  );
};

export default Tasks;
