# Google Authentication Setup Guide

Follow these steps to generate a **Google Client ID** and enable "Sign in with Google" for your application.

## Step 1: Create a Google Cloud Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click the project dropdown in the top bar (next to the Google Cloud logo).
3.  Click **New Project**.
4.  Enter a project name (e.g., `Hostel Management Auth`) and click **Create**.
5.  Select your newly created project from the notification or the project dropdown.

## Step 2: Configure OAuth Consent Screen
1.  In the left sidebar, go to **APIs & Services** > **OAuth consent screen**.
2.  Select **External** for User Type and click **Create**.
    *   *Note: If you have a Google Workspace organization, you can choose Internal, but External is standard for testing.*
3.  Fill in the required App Information:
    *   **App name**: Hostel Expense Management
    *   **User support email**: Select your email.
    *   **Developer contact information**: Enter your email.
4.  Click **Save and Continue** until you reach the dashboard (you can skip Scopes and Test Users for now).

## Step 3: Create Credentials
1.  In the left sidebar, click **Credentials**.
2.  Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3.  **Application type**: Select **Web application**.
4.  **Name**: Enter a name (e.g., `Hostel Frontend`).
5.  **Authorized JavaScript origins**:
    *   Click **ADD URI**.
    *   Enter: `http://localhost:8080`
6.  **Authorized redirect URIs**:
    *   Click **ADD URI**.
    *   Enter: `http://localhost:8080`
    *   *Note: Although we use popup flow, adding the URI here is good practice.*
7.  Click **Create**.

## Step 4: Copy Client ID
1.  A modal will appear with your "Your Client ID" and "Your Client Secret".
2.  Copy the **Client ID** (it ends with `.apps.googleusercontent.com`).
    *   *You do NOT need the Client Secret for this frontend integration.*

## Step 5: Configure Application
1.  Open your project in VS Code.
2.  Go to `frontend/.env`.
3.  Add or update the following line with your copied ID:
    ```env
    VITE_GOOGLE_CLIENT_ID=your-copied-client-id.apps.googleusercontent.com
    ```
4.  **Restart the frontend server**:
    *   Go to the terminal running the frontend.
    *   Press `Ctrl+C` to stop it.
    *   Run `npm run dev` again.

## Verification
1.  Open the application at `http://localhost:8080`.
2.  Go to the Login or Register page.
3.  Click the "Sign in with Google" button.
4.  You should see the Google popup asking you to select an account.
