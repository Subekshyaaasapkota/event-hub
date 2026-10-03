#  Club Verification & Email Workflow Plan

## Phase 1: Email Infrastructure (Backend)
1. **Dependencies**: Install `nodemailer` in the server to handle outgoing emails.
2. **Environment**: Add `EMAIL_USER` and `EMAIL_PASS` (App Password) to the `.env` file.
3. **Mailer Service**: Create a dedicated utility `server/src/utils/emailService.js` to send professional HTML templates.

## Phase 2: Security & Permissions (Backend)
1. **Event Restriction**: Modify the `addEvents` controller to verify that the user's club status is exactly `"Approved"`. If not, they will be blocked from creating events.
2. **Role Sync**: Ensure the `"Club"` role is only granted to the [User](cci:1://file:///w:/PROJECT/EventHub/client/src/pages/admin/AllUsers.jsx:20:0-342:2) document *after* Admin approval.

## Phase 3: Admin Dashboard Upgrade (Frontend)
1. **Verification Center**: Polish the `ClubVerification.jsx` page to show a detailed view of the club (Category, Description, Website, Social Links).
2. **Real-time Approval**: Connect the "Approve" button to the mailer trigger. Once clicked, the backend will update the DB and immediately fire the email.

## Phase 4: Email Template
1. **Design**: Create a simple, clean email template:
  - "Congratulations! Your club **[Club Name]** has been verified."
  - "You can now login to EventHub and start creating your own IT events."
  - Includes a link to the dashboard.

## Phase 5: User Workspace (Frontend)
1. **Status Visibility**: If a user is "Pending", show a friendly banner: "Your club is currently under review by our team. You will be notified via email once verified."
