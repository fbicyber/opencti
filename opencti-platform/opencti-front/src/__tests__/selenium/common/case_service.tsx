import { By } from 'selenium-webdriver';
import {
  getElementWithTimeout,
  getSubElementWithTimeout,
  wait,
  replaceTextFieldValue,
  getDateTime,
} from './action_service';
import { goToObjectOverview, selectObject } from './domain_object_service';

/**
 * Navigates to the Cases Incident Response list displayer.
 *
 * @param id Optional internal ID of the Case Object
 */
export async function navigateToCaseIncidentResponse(id = '') {
  await goToObjectOverview('cases', 'incidents', id);
}

/**
 * Assuming we are on the Cases Incident Response list displayer, click the create
 * button and create a new Incident Response.
 *
 * @param name The name of the Incident Response to create.
 * @param description The description of the Incident Response to create.
 */
export async function addCaseIncidentResponse(name: string, description: string) {
  // Click add button
  const addBtn = await getElementWithTimeout(By.id('add-incident-response'));
  await addBtn.click();

  // Fill name
  const nameField = await getElementWithTimeout(By.id('add-incident-response-name'));
  // Sometimes fails to find name field fast enough.
  await wait(1000);
  await nameField.click();
  await nameField.sendKeys(name);

  // Fill Incident Date
  const incidentDate = await getElementWithTimeout(By.id('add-incident-response-date'));
  await wait(1000);
  await incidentDate.click();
  const formattedDate = getDateTime();
  await replaceTextFieldValue(incidentDate, formattedDate);
  await wait(1000);

  // Fill description
  const descriptionField = await getSubElementWithTimeout(
    'id',
    'add-incident-response-description',
    'textarea',
  );
  await descriptionField.click();
  await descriptionField.sendKeys(description);

  // Click create button
  const createBtn = await getElementWithTimeout(By.id('add-incident-response-create'));
  await createBtn.click();
}

export async function editCaseIncidentResponse(name:string, description: string) {
  // Click edit button
  await wait(3000);
  const editButton = await getElementWithTimeout(By.id('edit-case'));
  await editButton.click();

  // Fill name
  const nameField = await getElementWithTimeout(By.id('add-incident-response-name'));
  // Sometimes fails to find name field fast enough.
  await wait(1000);
  await nameField.click();
  await wait(2000);
  await replaceTextFieldValue(nameField, name);
  await wait(2000);
  // Fill Incident Date
  const incidentDate = await getElementWithTimeout(By.id('add-incident-response-date'));
  await wait(1000);
  await incidentDate.click();
  await wait(2000);
  const formattedDate = getDateTime();
  await replaceTextFieldValue(incidentDate, formattedDate);
  await wait(1000);

  const descriptionField = await getSubElementWithTimeout(
    'id',
    'add-incident-response-description',
    'textarea',
  );
  await wait(2000);
  await descriptionField.click();
  await wait(2000);
  await replaceTextFieldValue(descriptionField, description);
  await wait(3000);
  const closeButton = await getElementWithTimeout(By.id('CloseIcon'));
  await closeButton.click();
  await wait(3000);
}

/**
 * Tries to click on a Case Incident Response with the given name.
 *
 * @param name The name of the Case Incident Response to select.
 */
export async function selectCaseIncidentResponse(name: string) {
  await navigateToCaseIncidentResponse();
  await selectObject(name);
}

export async function navigateToCaseIncidentResponseHelperSelect(name: string, id = '') {
  navigateToCaseIncidentResponse(id);
  selectCaseIncidentResponse(name);
}
