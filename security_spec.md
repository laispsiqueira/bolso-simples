# Security Specification - Bolso Simples

## 1. Data Invariants
- Users can only read and write their own data (`userId` field must match `request.auth.uid`).
- Admin users can impersonate (read) other users' data if the application specifically supports it, but for strict security, we will implement RLS based on `auth.uid()`.
- Transactions must have valid dates and non-zero amounts.
- Category rules must have unique keywords per user (enforced by application logic, rules ensure ownership).
- Roles are immutable by the user themselves; only a system-level or admin process can change them.

## 2. The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Creating a transaction with `userId: "attacker_id"` while logged in as `user_id`.
2. **Role Escalation**: Updating user profile to `role: "ADMIN"`.
3. **Cross-User Leak**: Listing transactions without a `userId` filter matching the current user.
4. **Value Poisoning**: Sending a transaction with `amount: "one million"` (string instead of number).
5. **ID Injection**: Using a 2KB string as a transaction ID.
6. **Orphaned Record**: Creating a transaction for a non-existent user profile (relational check).
7. **Negative Amount**: (If applicable) Submitting a transaction with `amount: -999999` if logic forbids it.
8. **Shadow Field**: Adding `isVerified: true` to a transaction document.
9. **History Tampering**: Updating `createdAt` on an existing transaction.
10. **State Shortcut**: Changing a simulation priority to an invalid tier.
11. **PII Leak**: Accessing another user's `User` profile to see their email.
12. **Duplicate Suppression Bypass**: Creating a `ProcessedFile` entry for another user.

## 3. Test Runner (Draft Plan)
The tests will verify that each of these malicious payloads returns `PERMISSION_DENIED`.
