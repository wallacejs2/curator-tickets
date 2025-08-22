import { Ticket, BaseTicket, IssueTicket, FeatureRequestTicket, Update } from '../types.ts';

// Add gapi and google types to the global scope
declare global {
  const gapi: any;
  const google: any;
}

const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

let authStateChangeCallback: (isLoggedIn: boolean) => void;

// Define a consistent header order for all ticket properties
const BASE_TICKET_KEYS: (keyof BaseTicket)[] = ['id', 'type', 'productArea', 'platform', 'pmrNumber', 'fpTicketNumber', 'ticketThreadId', 'submissionDate', 'startDate', 'estimatedCompletionDate', 'completionDate', 'status', 'priority', 'submitterName', 'client', 'location', 'title', 'updates', 'completionNotes', 'onHoldReason'];
const ISSUE_TICKET_KEYS: (keyof IssueTicket)[] = ['problem', 'duplicationSteps', 'workaround', 'frequency'];
const FEATURE_REQUEST_TICKET_KEYS: (keyof FeatureRequestTicket)[] = ['improvement', 'currentFunctionality', 'suggestedSolution', 'benefits'];
export const HEADERS = [...new Set([...BASE_TICKET_KEYS, ...ISSUE_TICKET_KEYS, ...FEATURE_REQUEST_TICKET_KEYS])];
const headerMap = new Map(HEADERS.map((h, i) => [h, i]));

const rowToTicket = (row: any[], rowIndex: number): Ticket => {
    const ticket: any = {};
    for (const [key, index] of headerMap.entries()) {
        let value = row[index];
        if (value === undefined || value === null || value === '') continue;

        if (key === 'updates') {
            try {
                // Ensure updates are properly parsed, defaulting to empty array
                const parsed = JSON.parse(value);
                ticket[key] = Array.isArray(parsed) ? parsed : [];
            } catch {
                ticket[key] = [];
            }
        } else {
             ticket[key] = value;
        }
    }
    ticket.rowIndex = rowIndex + 1; // Sheets are 1-indexed
    return ticket as Ticket;
};

const ticketToRow = (ticket: Ticket): any[] => {
    const row = new Array(HEADERS.length).fill('');
    for (const key of HEADERS) {
        const index = headerMap.get(key as keyof Ticket);
        if (index !== undefined) {
            let value = (ticket as any)[key];
            if (key === 'updates' && value) {
                row[index] = JSON.stringify(value, null, 2); // Pretty print for readability in sheet
            } else if (value !== undefined && value !== null) {
                row[index] = value;
            }
        }
    }
    return row;
};


const ensureHeaders = async (spreadsheetId: string, sheetName = 'Sheet1') => {
    const range = `${sheetName}!A1:1`;
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    const currentHeaders = response.result.values ? response.result.values[0] : [];
    if (!currentHeaders || currentHeaders.length === 0) {
        // Sheet is empty, write headers
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: {
                values: [HEADERS],
            },
        });
    }
};

/**
 * Initializes the GAPI client, and the GIS client.
 */
export async function init(clientId: string, callback: (isLoggedIn: boolean) => void) {
    authStateChangeCallback = callback;

    const gapiPromise = new Promise<void>((resolve, reject) => {
        if (typeof gapi === 'undefined' || !gapi.load) {
            return reject(new Error("gapi is not loaded"));
        }
        gapi.load('client', () => {
            gapi.client.init({
                discoveryDocs: [DISCOVERY_DOC],
            }).then(() => {
                gapiInited = true;
                resolve();
            }).catch(reject);
        });
    });

    const gisPromise = new Promise<void>((resolve, reject) => {
        if (typeof google === 'undefined' || !google.accounts) {
            return reject(new Error("google.accounts is not loaded"));
        }
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: (tokenResponse: any) => {
                // This callback is triggered after user signs in and grants consent
                if (tokenResponse && !tokenResponse.error) {
                    authStateChangeCallback(true);
                } else {
                    console.error("Authentication error:", tokenResponse.error);
                    authStateChangeCallback(false);
                }
            },
        });
        gisInited = true;
        resolve();
    });

    await Promise.all([gapiPromise, gisPromise]);
}


export function handleAuthClick() {
  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // User is already signed in
    authStateChangeCallback(true);
  }
}

export function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token, () => {
      gapi.client.setToken('');
      authStateChangeCallback(false);
    });
  }
}

export async function listTickets(spreadsheetId: string): Promise<Ticket[]> {
    if (!gapiInited || !gisInited) throw new Error("Google API clients not initialized.");
    
    await ensureHeaders(spreadsheetId);

    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A2:ZZ', // Get all data starting from the second row
    });

    const values = response.result.values || [];
    return values.map((row, index) => rowToTicket(row, index + 1)).filter(t => t.id); // +1 because we start at A2
}


export async function createTicket(spreadsheetId: string, ticket: Ticket): Promise<void> {
    const rowData = ticketToRow(ticket);
    await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:A',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [rowData],
        },
    });
}

async function findRowIndexById(spreadsheetId: string, ticketId: string): Promise<number> {
    const idColumnIndex = headerMap.get('id');
    if (idColumnIndex === undefined) throw new Error("ID column not found in headers");
    
    // Convert column index to letter (0 -> A, 1 -> B, etc.)
    const idColumnLetter = String.fromCharCode('A'.charCodeAt(0) + idColumnIndex);
    
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `Sheet1!${idColumnLetter}2:${idColumnLetter}`, // Get all IDs from the second row
    });

    const ids = response.result.values?.flat() || [];
    const rowIndex = ids.findIndex(id => id === ticketId);

    if (rowIndex === -1) {
        throw new Error(`Ticket with ID ${ticketId} not found in the sheet.`);
    }

    return rowIndex + 2; // +2 because sheet is 1-indexed and we skipped the header row
}


export async function updateTicket(spreadsheetId: string, ticket: Ticket): Promise<void> {
    const rowIndex = (ticket as any).rowIndex || await findRowIndexById(spreadsheetId, ticket.id);
    const rowData = ticketToRow(ticket);
    
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [rowData],
        },
    });
}


export async function deleteTicket(spreadsheetId: string, ticketId: string): Promise<void> {
    const rowIndex = await findRowIndexById(spreadsheetId, ticketId);
    
    await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: 0, // Assuming the first sheet
                        dimension: 'ROWS',
                        startIndex: rowIndex - 1, // API is 0-indexed
                        endIndex: rowIndex
                    }
                }
            }]
        }
    });
}
