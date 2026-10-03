# Account email and passwords

## IMPORTANT

Do **not** commit real account credentials. `.env` files and this file are
excluded from version control by `.gitignore`.

## Creating your own accounts

EventHub has no seed script, so create the accounts you need through the UI and
then promote the admin account manually:

1. Sign up at `http://localhost:5173/signup` - new accounts are always created
  with the `Student` role for security (the client can never choose a role).
2. Promote an account to Admin from a MongoDB shell:

  ```js
  use eventhub
  db.users.updateOne(
  { email: "you@example.com" },
  { $set: { roles: ["Admin"] } }
  )
  ```

3. Verified Club accounts are granted by an existing Admin from
  `/admin/club/verification`. There is no client-side way to self-assign the
  `Club` role.

## Rotating exposed credentials

The credentials that were previously stored in this file, and any credentials in
an old `server/.env` / `client/.env`, must be considered compromised:

- Change the passwords of every seeded demo account.
- Rotate MongoDB Atlas database users and IP allowlists.
- Rotate Khalti, eSewa, Resend, Cloudinary, and JWT secrets.
- Commit the rotated values only to your private `.env` files.

Place your own local login details here (this file is untracked):

```
Admin id =>
email :
password :

Student id =>
email :
password :
```