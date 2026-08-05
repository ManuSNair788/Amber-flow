# Security Policy: Access Control & Authentication

To ensure the utmost security of the Partnership Operations AI Assistant (POAI) and protect sensitive student and partner data, strict access control measures must be enforced.

## Authentication Requirement

Access to the POAI dashboard and all associated modules is strictly restricted to authorized personnel only. 

### 1. Domain Restriction
Users **must** authenticate using a valid corporate email address ending in the approved domain:
- **`@amberstudent.com`**

Attempts to log in or access the system using any other email domain (e.g., @gmail.com, @yahoo.com, or other corporate domains) must be automatically rejected by the authentication system.

### 2. OTP (One-Time Password) Authentication
Standard password-based authentication is discouraged. Instead, the system utilizes a secure, passwordless OTP flow.

- **Every time** a user attempts to open the application or their active session expires, they must enter their `@amberstudent.com` email address on the login screen.
- A unique, time-sensitive One-Time Password (OTP) will be sent to that email address.
- The user must enter the OTP to verify their identity and gain access to the system.

## Implementation Guidelines (For Developers)
When integrating the final authentication flow (e.g., via Supabase Auth), ensure the following configurations are active:
1. **Passwordless Sign-In:** Configure the authentication provider to send OTPs via email rather than relying on static passwords.
2. **Domain Allowlist:** Implement an email domain allowlist within the Supabase authentication settings (or via a database trigger/middleware) to instantly reject any signup/login attempt where the email does not match `*@amberstudent.com`.
3. **Session Management:** Ensure session tokens have an appropriate, short-lived expiration time to mandate frequent re-authentication via OTP, adhering to the "every time" access policy.
