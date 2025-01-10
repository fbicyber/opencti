import React, { useState } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery, useRefetchableFragment } from 'react-relay';
import { Field, Form, Formik } from 'formik';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import * as Yup from 'yup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/styles';
import Switch from '@mui/material/Switch';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DangerZoneBlock from '../common/danger_zone/DangerZoneBlock';
import EEChip from '../common/entreprise_edition/EEChip';
import EnterpriseEditionButton from '../common/entreprise_edition/EnterpriseEditionButton';
import { SubscriptionFocus } from '../../../components/Subscription';
import { commitMutation, defaultCommitMutation } from '../../../relay/environment';
import { useFormatter } from '../../../components/i18n';
import TextField from '../../../components/TextField';
import SelectField from '../../../components/fields/SelectField';
import Loader from '../../../components/Loader';
import HiddenTypesField from './hidden_types/HiddenTypesField';
import { fieldSpacingContainerStyle } from '../../../utils/field';
import { isNotEmptyField } from '../../../utils/utils';
import SettingsMessages from './settings_messages/SettingsMessages';
import SettingsAnalytics from './settings_analytics/SettingsAnalytics';
import ItemBoolean from '../../../components/ItemBoolean';
import { availableLanguage } from '../../../components/AppIntlProvider';
import Breadcrumbs from '../../../components/Breadcrumbs';
import useSensitiveModifications from '../../../utils/hooks/useSensitiveModifications';
import Transition from '../../../components/Transition';
import useConnectedDocumentModifier from '../../../utils/hooks/useConnectedDocumentModifier';
import ThemesEditor, { refetchableThemesQuery } from './ThemesEditor';
import type { Theme } from '../../../components/Theme';
import { SettingsQuery } from './__generated__/SettingsQuery.graphql';
import { ThemesEditor_themes$key } from './__generated__/ThemesEditor_themes.graphql';

export const settingsQuery = graphql`
  query SettingsQuery {
    settings {
      id
      platform_title
      platform_favicon
      platform_email
      platform_theme
      platform_language
      platform_whitemark
      platform_login_message
      platform_banner_text
      platform_banner_level
      platform_theme_dark_background
      platform_theme_dark_paper
      platform_theme_dark_nav
      platform_theme_dark_primary
      platform_theme_dark_secondary
      platform_theme_dark_accent
      platform_theme_dark_logo
      platform_theme_dark_logo_collapsed
      platform_theme_dark_logo_login
      platform_theme_light_background
      platform_theme_light_paper
      platform_theme_light_nav
      platform_theme_light_primary
      platform_theme_light_secondary
      platform_theme_light_accent
      platform_theme_light_logo
      platform_theme_light_logo_collapsed
      platform_theme_light_logo_login
      platform_ai_enabled
      platform_ai_type
      platform_ai_model
      platform_ai_has_token
      platform_organization {
        id
        name
      }
      platform_modules {
        id
        enable
        running
      }
      platform_cluster {
        instances_number
      }
      editContext {
        name
        focusOn
      }
      platform_enterprise_edition {
        license_enterprise
        license_by_configuration
        license_valid_cert
        license_validated
        license_expiration_prevention
        license_customer
        license_expiration_date
        license_start_date
        license_platform_match
        license_expired
        license_type
        license_creator
        license_global
      }
      otp_mandatory
      ...SettingsMessages_settingsMessages
      analytics_google_analytics_v4
    }
    about {
      version
      dependencies {
        name
        version
      }
    }
    ...ThemesEditor_themes
  }
`;

export const settingsMutationFieldPatch = graphql`
  mutation SettingsFieldPatchMutation($id: ID!, $input: [EditInput]!) {
    settingsEdit(id: $id) {
      fieldPatch(input: $input) {
        id
        platform_title
        platform_favicon
        platform_email
        platform_theme
        platform_theme_dark_background
        platform_theme_dark_paper
        platform_theme_dark_nav
        platform_theme_dark_primary
        platform_theme_dark_secondary
        platform_theme_dark_accent
        platform_theme_dark_logo
        platform_theme_dark_logo_collapsed
        platform_theme_dark_logo_login
        platform_theme_light_background
        platform_theme_light_paper
        platform_theme_light_nav
        platform_theme_light_primary
        platform_theme_light_secondary
        platform_theme_light_accent
        platform_theme_light_logo
        platform_theme_light_logo_collapsed
        platform_theme_light_logo_login
        platform_language
        platform_whitemark
        platform_enterprise_edition {
          license_enterprise
          license_by_configuration
          license_valid_cert
          license_validated
          license_expiration_prevention
          license_customer
          license_expiration_date
          license_start_date
          license_platform_match
          license_expired
          license_type
          license_creator
          license_global
        }
        platform_login_message
        platform_banner_text
        platform_banner_level
        analytics_google_analytics_v4
      }
    }
  }
`;

const settingsFocus = graphql`
  mutation SettingsFocusMutation($id: ID!, $input: EditContext!) {
    settingsEdit(id: $id) {
      contextPatch(input: $input) {
        id
      }
    }
  }
`;

const Settings = (queryRef: PreloadedQuery<SettingsQuery>) => {
  const theme = useTheme<Theme>();

  const { isSensitive, isAllowed } = useSensitiveModifications('ce_ee_toggle');
  const [openEEChanges, setOpenEEChanges] = useState(false);

  const data = usePreloadedQuery<SettingsQuery>(settingsQuery, queryRef);
  const [{ themes }, refetch] = useRefetchableFragment<
  SettingsQuery,
  ThemesEditor_themes$key
  >(
    refetchableThemesQuery,
    data,
  );

  const { t_i18n } = useFormatter();
  const { setTitle } = useConnectedDocumentModifier();
  setTitle(t_i18n('Parameters | Settings'));

  const settingsValidation = Yup.object().shape({
    platform_title: Yup.string().required(t_i18n('This field is required')),
    platform_favicon: Yup.string().nullable(),
    platform_email: Yup.string()
      .required(t_i18n('This field is required'))
      .email(t_i18n('The value must be an email address')),
    platform_theme: Yup.string().nullable(),
    platform_theme_dark_background: Yup.string().nullable(),
    platform_theme_dark_paper: Yup.string().nullable(),
    platform_theme_dark_nav: Yup.string().nullable(),
    platform_theme_dark_primary: Yup.string().nullable(),
    platform_theme_dark_secondary: Yup.string().nullable(),
    platform_theme_dark_accent: Yup.string().nullable(),
    platform_theme_dark_logo: Yup.string().nullable(),
    platform_theme_dark_logo_collapsed: Yup.string().nullable(),
    platform_theme_dark_logo_login: Yup.string().nullable(),
    platform_theme_light_background: Yup.string().nullable(),
    platform_theme_light_paper: Yup.string().nullable(),
    platform_theme_light_nav: Yup.string().nullable(),
    platform_theme_light_primary: Yup.string().nullable(),
    platform_theme_light_secondary: Yup.string().nullable(),
    platform_theme_light_accent: Yup.string().nullable(),
    platform_theme_light_logo: Yup.string().nullable(),
    platform_theme_light_logo_collapsed: Yup.string().nullable(),
    platform_theme_light_logo_login: Yup.string().nullable(),
    platform_language: Yup.string().nullable(),
    platform_whitemark: Yup.string().nullable(),
    enterprise_edition: Yup.string().nullable(),
    platform_login_message: Yup.string().nullable(),
    platform_banner_text: Yup.string().nullable(),
    platform_banner_level: Yup.string().nullable(),
    analytics_google_analytics_v4: Yup.string().nullable(),
  });

  const handleChangeFocus = (id: string, name: string) => {
    commitMutation({
      ...defaultCommitMutation,
      mutation: settingsFocus,
      variables: {
        id,
        input: {
          focusOn: name,
        },
      },
    });
  };
  const handleSubmitField = (id: string, name: string, value: string | null) => {
    let finalValue = value ?? '';
    if (
      [
        'platform_theme_dark_background',
        'platform_theme_dark_paper',
        'platform_theme_dark_nav',
        'platform_theme_dark_primary',
        'platform_theme_dark_secondary',
        'platform_theme_dark_accent',
        'platform_theme_light_background',
        'platform_theme_light_paper',
        'platform_theme_light_nav',
        'platform_theme_light_primary',
        'platform_theme_light_secondary',
        'platform_theme_light_accent',
      ].includes(name)
      && finalValue.length > 0
    ) {
      if (!finalValue.startsWith('#')) {
        finalValue = `#${finalValue}`;
      }
      finalValue = finalValue.substring(0, 7);
      if (finalValue.length < 7) {
        finalValue = '#000000';
      }
    }
    settingsValidation
      .validateAt(name, { [name]: finalValue })
      .then(() => {
        commitMutation({
          ...defaultCommitMutation,
          mutation: settingsMutationFieldPatch,
          variables: { id, input: { key: name, value: finalValue || '' } },
        });
      })
      .catch(() => false);
  };
  const handleRefetch = () => refetch(
    {},
    { fetchPolicy: 'network-only' },
  );

  const { settings, about } = data;

  if (!settings || !about || !themes?.edges) return (<Loader />);

  const { id, editContext } = settings;
  const valsToPick: (keyof typeof settings)[] = [
    'platform_title',
    'platform_favicon',
    'platform_email',
    'platform_theme',
    'platform_language',
    'platform_login_message',
    'platform_banner_text',
    'platform_banner_level',
    'platform_theme_dark_background',
    'platform_theme_dark_paper',
    'platform_theme_dark_nav',
    'platform_theme_dark_primary',
    'platform_theme_dark_secondary',
    'platform_theme_dark_accent',
    'platform_theme_dark_logo',
    'platform_theme_dark_logo_collapsed',
    'platform_theme_dark_logo_login',
    'platform_theme_light_background',
    'platform_theme_light_paper',
    'platform_theme_light_nav',
    'platform_theme_light_primary',
    'platform_theme_light_secondary',
    'platform_theme_light_accent',
    'platform_theme_light_logo',
    'platform_theme_light_logo_collapsed',
    'platform_theme_light_logo_login',
  ];
  const initialValues = valsToPick.reduce((acc, key) => {
    if (key in settings) {
      acc[key] = settings[key];
    }
    return acc;
  }, {} as Record<keyof typeof settings, unknown>);
  const modules = settings.platform_modules;
  const { version, dependencies } = about;
  const isEnterpriseEdition = isNotEmptyField(
    settings.enterprise_edition,
  );
  let aiPoweredLabel = t_i18n('Disabled');
  if (settings.platform_ai_enabled) {
    if (settings.platform_ai_has_token) {
      aiPoweredLabel = `${settings.platform_ai_type}`;
    } else {
      aiPoweredLabel = `${settings.platform_ai_type} - ${t_i18n('Missing token')}`;
    }
  }

  return (
    <>
      <Breadcrumbs elements={[{ label: t_i18n('Settings') }, { label: t_i18n('Parameters'), current: true }]} />
      <Grid container={true} spacing={3}>
        <Grid item xs={6}>
          <Typography variant="h4" gutterBottom={true}>
            {t_i18n('Configuration')}
          </Typography>
          <Paper
            style={{
              marginTop: theme.spacing(1),
              padding: 20,
              borderRadius: 4,
            }}
            variant="outlined"
            className={'paper-for-grid'}
          >
            <Formik
              onSubmit={() => {
              }}
              enableReinitialize={true}
              initialValues={initialValues}
              validationSchema={settingsValidation}
            >
              {() => (
                <Form>
                  <Field
                    component={TextField}
                    variant="standard"
                    name="platform_title"
                    label={t_i18n('Platform title')}
                    fullWidth
                    onFocus={(name: string) => handleChangeFocus(id, name)}
                    onSubmit={(name: string, value: string) => handleSubmitField(id, name, value)
                    }
                    helperText={
                      <SubscriptionFocus
                        context={editContext}
                        fieldName="platform_title"
                      />
                    }
                  />
                  <Field
                    component={TextField}
                    variant="standard"
                    name="platform_favicon"
                    label={t_i18n('Platform favicon URL')}
                    fullWidth
                    style={{ marginTop: 20 }}
                    onFocus={(name: string) => handleChangeFocus(id, name)}
                    onSubmit={(name: string, value: string) => handleSubmitField(id, name, value)
                    }
                    helperText={
                      <SubscriptionFocus
                        context={editContext}
                        fieldName="platform_favicon"
                      />
                    }
                  />
                  <Field
                    component={TextField}
                    variant="standard"
                    name="platform_email"
                    label={t_i18n('Sender email address')}
                    fullWidth
                    style={{ marginTop: 20 }}
                    onFocus={(name: string) => handleChangeFocus(id, name)}
                    onSubmit={(name: string, value: string) => handleSubmitField(id, name, value)
                    }
                    helperText={
                      <SubscriptionFocus
                        context={editContext}
                        fieldName="platform_email"
                      />
                    }
                  />
                  <Field
                    component={SelectField}
                    variant="standard"
                    name="platform_theme"
                    label={t_i18n('Default theme')}
                    fullWidth
                    containerstyle={fieldSpacingContainerStyle}
                    onFocus={(name: string) => handleChangeFocus(id, name)}
                    onChange={(name: string, value: string) => handleSubmitField(id, name, value)
                    }
                    helpertext={
                      <SubscriptionFocus
                        context={editContext}
                        fieldName="platform_theme"
                      />
                    }
                  >
                    {themes.edges?.filter((node) => !!node).map(({ node }) => (
                      <MenuItem key={node.id} value={node.name}>{node.name}</MenuItem>
                    ))}
                  </Field>
                  <Field
                    component={SelectField}
                    variant="standard"
                    name="platform_language"
                    label={t_i18n('Language')}
                    fullWidth
                    containerstyle={fieldSpacingContainerStyle}
                    onFocus={(name: string) => handleChangeFocus(id, name)}
                    onChange={(name: string, value: string) => handleSubmitField(id, name, value)}
                    helpertext={
                      <SubscriptionFocus
                        context={editContext}
                        fieldName="platform_language"
                      />
                    }
                  >
                    <MenuItem value="auto">
                      <em>{t_i18n('Automatic')}</em>
                    </MenuItem>
                    {
                      availableLanguage.map(({ value, label }) => <MenuItem key={value} value={value}>{label}</MenuItem>)
                    }
                  </Field>
                  <HiddenTypesField />
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
            {t_i18n('OpenCTI platform')}
          </Typography>
          <div style={{ float: 'right', marginTop: isSensitive ? theme.spacing(-5) : theme.spacing(-4.5), position: 'relative' }}>
            {!isEnterpriseEdition ? (
              <EnterpriseEditionButton disabled={!isAllowed} inLine />
            ) : (
              <DangerZoneBlock
                type={'ce_ee_toggle'}
                sx={{
                  root: { border: 'none', padding: 0, margin: 0 },
                  title: { position: 'absolute', zIndex: 2, left: 4, top: 9, fontSize: 8 },
                }}
              >
                {({ disabled }) => (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      color={isSensitive ? 'warning' : 'primary'}
                      onClick={() => setOpenEEChanges(true)}
                      disabled={disabled}
                      style={isSensitive
                        ? {
                          color: isAllowed ? theme.palette.dangerZone.text?.primary : theme.palette.dangerZone.text?.disabled,
                          borderColor: theme.palette.dangerZone.main,
                        }
                        : undefined}
                    >
                      {t_i18n('Disable Enterprise Edition')}
                    </Button>
                    <Dialog
                      PaperProps={{ elevation: 1 }}
                      open={openEEChanges}
                      keepMounted
                      TransitionComponent={Transition}
                      onClose={() => setOpenEEChanges(false)}
                    >
                      <DialogTitle>{t_i18n('Disable Enterprise Edition')}</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          <Alert
                            severity="warning"
                            variant="outlined"
                            color="dangerZone"
                            style={{
                              borderColor: theme.palette.dangerZone.main,
                            }}
                          >
                            {t_i18n(
                              'You are about to disable the "Enterprise Edition" mode. Please note that this action will disable access to certain advanced features (Organization segregation, Automation, File indexing, Activity monitoring...). However, your existing data will remain intact and will not be lost.',
                            )}
                          </Alert>
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => {
                            setOpenEEChanges(false);
                          }}
                        >
                          {t_i18n('Cancel')}
                        </Button>
                        <Button
                          color="secondary"
                          onClick={() => {
                            setOpenEEChanges(false);
                            handleSubmitField(id, 'enterprise_edition', '');
                          }}
                        >
                          {t_i18n('Validate')}
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )}
              </DangerZoneBlock>
            )}
          </div>
          <Paper
            style={{
              marginTop: theme.spacing(1),
              padding: 20,
              borderRadius: 4,
            }}
            className={'paper-for-grid'}
            variant="outlined"
          >
            <Formik
              onSubmit={() => {
              }}
              enableReinitialize={true}
              initialValues={initialValues}
              validationSchema={settingsValidation}
            >
              {() => (
                <Form>
                  <List style={{ marginTop: -20 }}>
                    <ListItem divider={true}>
                      <ListItemText primary={t_i18n('Version')} />
                      <ItemBoolean
                        variant="large"
                        neutralLabel={version}
                        status={null}
                      />
                    </ListItem>
                    <ListItem divider={true}>
                      <ListItemText primary={t_i18n('Edition')} />
                      <ItemBoolean
                        variant="large"
                        neutralLabel={
                          isEnterpriseEdition
                            ? t_i18n('Enterprise')
                            : t_i18n('Community')
                        }
                        status={null}
                      />
                    </ListItem>
                    <ListItem divider={true}>
                      <ListItemText
                        primary={t_i18n('Architecture mode')}
                      />
                      <ItemBoolean
                        variant="large"
                        neutralLabel={
                          settings.platform_cluster.instances_number
                          > 1
                            ? t_i18n('Cluster')
                            : t_i18n('Standalone')
                        }
                        status={null}
                      />
                    </ListItem>
                    <ListItem divider={true}>
                      <ListItemText
                        primary={t_i18n('Number of node(s)')}
                      />
                      <ItemBoolean
                        variant="large"
                        neutralLabel={
                          `${settings.platform_cluster.instances_number}`
                        }
                        status={null}
                      />
                    </ListItem>
                    <ListItem divider={true}>
                      <ListItemText
                        primary={t_i18n('AI Powered')}
                      />
                      <ItemBoolean
                        variant="large"
                        label={aiPoweredLabel}
                        status={settings.platform_ai_enabled && settings.platform_ai_has_token}
                        tooltip={settings.platform_ai_has_token ? `${settings.platform_ai_type} - ${settings.platform_ai_model}` : t_i18n('The token is missing in your platform configuration, please ask your Filigran representative to provide you with it or with on-premise deployment instructions. Your can open a support ticket to do so.')}
                      />
                    </ListItem>
                    <ListItem divider={true}>
                      <Field
                        component={TextField}
                        type="number"
                        variant="standard"
                        disabled={true}
                        name="filigran_support_key"
                        label={t_i18n('Filigran support key')}
                        fullWidth={true}
                      />
                    </ListItem>
                    <ListItem divider={true}>
                      <ListItemText
                        primary={
                          <>
                            {t_i18n('Remove Filigran logos')}
                            <EEChip />
                          </>
                        }
                      ></ListItemText>
                      <Field
                        component={Switch}
                        variant="standard"
                        name="platform_whitemark"
                        disabled={!isEnterpriseEdition}
                        checked={
                          settings.platform_whitemark
                          && isEnterpriseEdition
                        }
                        onChange={(_: React.ChangeEvent, value: string) => handleSubmitField(
                          id,
                          'platform_whitemark',
                          value,
                        )
                        }
                      />
                    </ListItem>
                  </List>
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <SettingsMessages settings={settings} />
        </Grid>
        <Grid item xs={4}>
          <SettingsAnalytics
            settings={settings}
            handleChangeFocus={handleChangeFocus}
            handleSubmitField={handleSubmitField}
            isEnterpriseEdition={isEnterpriseEdition}
          />
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h4" gutterBottom={true}>
            {t_i18n('Theme Settings')}
            <ThemesEditor
              themes={themes}
              refetch={handleRefetch}
              editContext={editContext as {
                name: string,
                focusOn: string
              }[]}
            />
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h4" gutterBottom={true}>
            {t_i18n('Tools')}
          </Typography>
          <Paper
            style={{
              marginTop: theme.spacing(1),
              padding: 20,
              borderRadius: 4,
            }}
            className={'paper-for-grid'}
            variant="outlined"
          >
            <List style={{ marginTop: -20 }}>
              {modules?.map((module) => {
                const isEeModule = ['ACTIVITY_MANAGER', 'PLAYBOOK_MANAGER', 'FILE_INDEX_MANAGER'].includes(module.id);
                let status = module.enable;
                if (!isEnterpriseEdition && isEeModule) {
                  status = true;
                }
                return (
                  <ListItem key={module.id} divider={true}>
                    <ListItemText primary={t_i18n(module.id)} />
                    <ItemBoolean
                      variant="large"
                      label={module.enable ? t_i18n('Enabled') : t_i18n('Disabled')}
                      status={status}
                    />
                  </ListItem>
                );
              })}
              {dependencies.map((dep) => (
                <ListItem key={dep.name} divider={true}>
                  <ListItemText primary={t_i18n(dep.name)} />
                  <ItemBoolean
                    variant="large"
                    neutralLabel={dep.version}
                    status={null}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Settings;
