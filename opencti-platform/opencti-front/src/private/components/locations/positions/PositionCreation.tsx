import React, { FunctionComponent } from 'react';
import { Field, Form, Formik } from 'formik';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import { graphql, useMutation } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import { FormikConfig } from 'formik/dist/types';
import Drawer, { DrawerVariant } from '@components/common/drawer/Drawer';
import ConfidenceField from '@components/common/form/ConfidenceField';
import { useFormatter } from '../../../../components/i18n';
import { handleErrorInForm } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkdownField from '../../../../components/MarkdownField';
import { ExternalReferencesField } from '../../common/form/ExternalReferencesField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import { insertNode } from '../../../../utils/store';
import { useSchemaCreationValidation, useIsMandatoryAttribute } from '../../../../utils/hooks/useEntitySettings';
import { Theme } from '../../../../components/Theme.d';
import { Option } from '../../common/form/ReferenceField';
import { PositionCreationMutation, PositionCreationMutation$variables } from './__generated__/PositionCreationMutation.graphql';
import { PositionsLinesPaginationQuery$variables } from './__generated__/PositionsLinesPaginationQuery.graphql';
import useDefaultValues from '../../../../utils/hooks/useDefaultValues';
import CustomFileUploader from '../../common/files/CustomFileUploader';

const useStyles = makeStyles<Theme>((theme) => ({
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const positionMutation = graphql`
  mutation PositionCreationMutation($input: PositionAddInput!) {
    positionAdd(input: $input) {
      id
      standard_id
      name
      description
      confidence
      entity_type
      parent_types
      ...PositionLine_node
    }
  }
`;

const POSITION_TYPE = 'Position';

interface PositionAddInput {
  name: string;
  description: string;
  confidence: number | undefined;
  latitude: string;
  longitude: string;
  street_address: string;
  postal_code: string;
  createdBy: Option | undefined;
  objectMarking: Option[];
  objectLabel: Option[];
  externalReferences: { value: string }[];
  file: File | undefined;
}

interface PositionFormProps {
  updater: (store: RecordSourceSelectorProxy, key: string) => void;
  onReset?: () => void;
  onCompleted?: () => void;
  defaultCreatedBy?: { value: string; label: string };
  defaultMarkingDefinitions?: { value: string; label: string }[];
  inputValue?: string;
}

export const PositionCreationForm: FunctionComponent<PositionFormProps> = ({
  updater,
  onReset,
  onCompleted,
  defaultCreatedBy,
  defaultMarkingDefinitions,
}) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const { mandatoryAttributes } = useIsMandatoryAttribute(
    POSITION_TYPE,
  );
  const basicShape = {
    name: Yup.string().min(2),
    description: Yup.string().nullable(),
    confidence: Yup.number().nullable(),
    latitude: Yup.number()
      .typeError(t_i18n('This field must be a number'))
      .nullable(),
    longitude: Yup.number()
      .typeError(t_i18n('This field must be a number'))
      .nullable(),
    street_address: Yup.string()
      .nullable()
      .max(1000, t_i18n('The value is too long')),
    postal_code: Yup.string().nullable().max(1000, t_i18n('The value is too long')),
  };
  const positionValidator = useSchemaCreationValidation(
    POSITION_TYPE,
    basicShape,
  );
  const [commit] = useMutation<PositionCreationMutation>(positionMutation);
  const onSubmit: FormikConfig<PositionAddInput>['onSubmit'] = (
    values,
    { setSubmitting, setErrors, resetForm },
  ) => {
    const input: PositionCreationMutation$variables['input'] = {
      name: values.name,
      description: values.description,
      confidence: parseInt(String(values.confidence), 10),
      latitude: parseFloat(values.latitude),
      longitude: parseFloat(values.longitude),
      street_address: values.street_address,
      postal_code: values.postal_code,
      createdBy: values.createdBy?.value,
      objectMarking: values.objectMarking.map((v) => v.value),
      objectLabel: values.objectLabel.map((v) => v.value),
      externalReferences: values.externalReferences.map(({ value }) => value),
      file: values.file,
    };
    commit({
      variables: {
        input,
      },
      updater: (store) => {
        if (updater) {
          updater(store, 'positionAdd');
        }
      },
      onError: (error) => {
        handleErrorInForm(error, setErrors);
        setSubmitting(false);
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        if (onCompleted) {
          onCompleted();
        }
      },
    });
  };
  const initialValues = useDefaultValues(POSITION_TYPE, {
    name: '',
    description: '',
    confidence: undefined,
    latitude: '',
    longitude: '',
    street_address: '',
    postal_code: '',
    createdBy: defaultCreatedBy,
    objectMarking: defaultMarkingDefinitions ?? [],
    objectLabel: [],
    externalReferences: [],
    file: undefined,
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={positionValidator}
      onSubmit={onSubmit}
      onReset={onReset}
    >
      {({ submitForm, handleReset, isSubmitting, setFieldValue, values }) => (
        <Form style={{ margin: '20px 0 20px 0' }}>
          <Field
            component={TextField}
            variant="standard"
            name="name"
            label={t_i18n('Name')}
            required={(mandatoryAttributes.includes('name'))}
            fullWidth={true}
            detectDuplicate={['Position']}
          />
          <Field
            component={MarkdownField}
            name="description"
            label={t_i18n('Description')}
            required={(mandatoryAttributes.includes('description'))}
            fullWidth={true}
            multiline={true}
            rows={4}
            style={{ marginTop: 20 }}
          />
          <ConfidenceField
            entityType="Position"
            containerStyle={fieldSpacingContainerStyle}
          />
          <Field
            component={TextField}
            variant="standard"
            name="latitude"
            label={t_i18n('Latitude')}
            required={(mandatoryAttributes.includes('latitude'))}
            fullWidth={true}
            style={{ marginTop: 20 }}
          />
          <Field
            component={TextField}
            variant="standard"
            name="longitude"
            label={t_i18n('Longitude')}
            required={(mandatoryAttributes.includes('longitude'))}
            fullWidth={true}
            style={{ marginTop: 20 }}
          />
          <Field
            component={TextField}
            variant="standard"
            name="street_address"
            label={t_i18n('Street address')}
            required={(mandatoryAttributes.includes('street_address'))}
            fullWidth={true}
            style={{ marginTop: 20 }}
          />
          <Field
            component={TextField}
            variant="standard"
            name="postal_code"
            label={t_i18n('Postal code')}
            required={(mandatoryAttributes.includes('postal_code'))}
            fullWidth={true}
            style={{ marginTop: 20 }}
          />
          <CreatedByField
            name="createdBy"
            required={(mandatoryAttributes.includes('createdBy'))}
            style={fieldSpacingContainerStyle}
            setFieldValue={setFieldValue}
          />
          <ObjectLabelField
            name="objectLabel"
            required={(mandatoryAttributes.includes('objectLabel'))}
            style={fieldSpacingContainerStyle}
            setFieldValue={setFieldValue}
            values={values.objectLabel}
          />
          <ObjectMarkingField
            name="objectMarking"
            required={(mandatoryAttributes.includes('objectMarking'))}
            style={fieldSpacingContainerStyle}
          />
          <ExternalReferencesField
            name="externalReferences"
            required={(mandatoryAttributes.includes('externalReferences'))}
            style={fieldSpacingContainerStyle}
            setFieldValue={setFieldValue}
            values={values.externalReferences}
          />
          <CustomFileUploader setFieldValue={setFieldValue} />
          <div className={classes.buttons}>
            <Button
              variant="contained"
              onClick={handleReset}
              disabled={isSubmitting}
              classes={{ root: classes.button }}
            >
              {t_i18n('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={submitForm}
              disabled={isSubmitting}
              classes={{ root: classes.button }}
            >
              {t_i18n('Create')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

const PositionCreation = ({
  paginationOptions,
}: {
  paginationOptions: PositionsLinesPaginationQuery$variables;
}) => {
  const { t_i18n } = useFormatter();
  const updater = (store: RecordSourceSelectorProxy) => insertNode(store, 'Pagination_positions', paginationOptions, 'positionAdd');
  return (
    <Drawer
      title={t_i18n('Create a position')}
      variant={DrawerVariant.create}
    >
      {({ onClose }) => (
        <PositionCreationForm
          updater={updater}
          onCompleted={onClose}
          onReset={onClose}
        />
      )}
    </Drawer>
  );
};

export default PositionCreation;
