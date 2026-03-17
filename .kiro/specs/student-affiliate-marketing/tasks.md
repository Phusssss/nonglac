# Implementation Plan: Student Affiliate Marketing System

## Overview

This implementation plan breaks down the Student Affiliate Marketing System into discrete coding tasks. The system enables students to earn rewards by referring new users, integrating with the existing mission system, registration flow, and admin dashboard. Implementation follows a phased approach: core infrastructure → registration flow → profile integration → mission rewards → admin dashboard → testing.

## Tasks

- [ ] 1. Set up core referral service infrastructure
  - [] 1.1 Create referralService.js with referral code generation
    - Implement `generateReferralCode(userId)` method that generates unique 6-12 character alphanumeric codes
    - Implement retry logic for uniqueness collisions (up to 10 attempts)
    - Add exponential backoff for database operations
    - _Requirements: 2.7, 8.1, 8.2, 8.6_
  
  - [ ]* 1.2 Write property test for referral code generation
    - **Property 4: Referral code uniqueness**
    - **Property 5: Referral code format**
    - **Validates: Requirements 8.1, 8.2, 8.6**
  
  - [] 1.3 Implement referral code validation in referralService.js
    - Implement `validateReferralCode(code)` method to check code exists and belongs to student
    - Add error handling for invalid codes with Vietnamese error messages
    - Implement self-referral prevention logic
    - _Requirements: 4.4, 8.3, 8.4, 4.6_
  
  - [ ]* 1.4 Write property test for referral code validation
    - **Property 11: Referral code validation**
    - **Property 13: Self-referral prevention**
    - **Validates: Requirements 4.4, 8.3, 8.4, 4.6, 8.5**
  
  - [] 1.5 Create Firestore collections and indexes
    - Create `referrals` collection schema with studentId, referredUserId, referralCode, mission completion tracking
    - Create `referralPoints` collection schema with transaction records
    - Add indexes: referralCode (users), studentId (referrals), referredUserId (referrals)
    - Update Firestore security rules for new collections
    - _Requirements: 9.5, 9.6_

- [ ] 2. Modify registration service for student and referral support
  - [] 2.1 Add student account creation to registrationService.js
    - Implement `createStudentAccount(studentData, password)` method
    - Add validation for studentId and universityName (non-empty, non-whitespace)
    - Store user with type="student", studentId, universityName, and generated referralCode
    - Call referralService to generate unique referral code
    - _Requirements: 2.3, 2.4, 2.5, 2.7, 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 2.2 Write property tests for student registration
    - **Property 2: Student field validation**
    - **Property 3: Student registration round-trip**
    - **Validates: Requirements 2.3, 2.4, 2.5, 2.7, 9.1, 9.2, 9.3, 9.4**
  
  - [ ] 2.3 Add referral code support to regular registration
    - Implement `createAccountWithReferral(userData, password, referralCode)` method
    - Validate referral code if provided (optional field)
    - Store referredBy field in user document
    - Create entry in referrals collection linking referred user to student
    - _Requirements: 4.2, 4.4, 4.5, 9.6_
  
  - [ ]* 2.4 Write property test for referral association
    - **Property 12: Referral association storage**
    - **Validates: Requirements 4.5, 9.6**

- [ ] 3. Create student campaign landing page
  - [ ] 3.1 Create StudentLandingPage component
    - Create new page component at `src/pages/StudentLandingPage.js`
    - Add hero section with campaign information and benefits list
    - Implement `handleRegisterClick()` to navigate to `/register?student=true`
    - Add visual elements explaining affiliate program
    - Style with Tailwind CSS matching existing design system
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 3.2 Add route for student landing page
    - Add route `/student-campaign` in App.js or routing configuration
    - Ensure route is publicly accessible (no auth required)
    - _Requirements: 1.4_

- [ ] 4. Modify registration flow for student and referral fields
  - [ ] 4.1 Update PersonalInfoStep component for student fields
    - Detect URL parameter `student=true` and store in component state
    - Add conditional rendering for studentId and universityName input fields
    - Add validation for student fields (required when student=true)
    - Update form submission to call createStudentAccount when student=true
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 4.2 Write property test for student parameter capture
    - **Property 1: Student registration parameter capture**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ] 4.3 Update PasswordStep component for referral code input
    - Add referral code input field that displays when student parameter is NOT present
    - Make referral code field optional
    - Auto-populate field from URL parameter `ref` if present
    - Add validation to check code format and existence on blur
    - Display Vietnamese error messages for invalid codes
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.5_
  
  - [ ]* 4.4 Write property test for referral code auto-population
    - **Property 10: Referral code auto-population**
    - **Validates: Requirements 4.3**

- [ ] 5. Checkpoint - Ensure registration flows work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Create affiliate section for student profiles
  - [ ] 6.1 Create AffiliateSection component
    - Create component at `src/features/user-profile/components/AffiliateSection.js`
    - Accept props: userId, referralCode, referralStats
    - Display referral code prominently
    - Generate and display referral link in format: `{baseUrl}/register?ref={referralCode}`
    - Add copy-to-clipboard button for referral link with success feedback
    - _Requirements: 3.2, 3.3, 3.4, 3.7_
  
  - [ ] 6.2 Add QR code generation to AffiliateSection
    - Install qrcode.react package: `npm install qrcode.react@^3.1.0`
    - Import and use QRCodeSVG component to encode referral link
    - Make QR code downloadable or shareable
    - _Requirements: 3.5, 3.6_
  
  - [ ]* 6.3 Write property tests for profile display
    - **Property 6: Student profile conditional display**
    - **Property 7: Referral link format**
    - **Property 8: QR code encoding**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
  
  - [ ] 6.4 Add referral statistics display to AffiliateSection
    - Display total referrals count
    - Display total points earned
    - Display level 1 mission completions count
    - Display level 2 mission completions count
    - Display list of recent referrals with names and registration dates
    - Style statistics as cards using Ant Design components
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_
  
  - [ ]* 6.5 Write property test for statistics accuracy
    - **Property 24: Profile statistics accuracy**
    - **Property 25: Recent referrals display**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.6**
  
  - [ ] 6.6 Integrate AffiliateSection into profile page
    - Modify user profile page to check if user.type === "student"
    - Conditionally render AffiliateSection for student users
    - Fetch referral statistics using referralService.getReferralStats()
    - _Requirements: 3.1, 3.2_
  
  - [ ]* 6.7 Write property test for conditional display
    - **Property 9: Non-student referral field display**
    - **Validates: Requirements 4.1, 4.2**

- [ ] 7. Implement referral statistics service methods
  - [ ] 7.1 Add getReferralStats method to referralService.js
    - Query referrals collection by studentId
    - Calculate total referrals count
    - Calculate level 1 and level 2 completion counts
    - Query referralPoints collection to sum total points
    - Fetch recent referrals (limit 10) with user details
    - Return structured ReferralStats object
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_
  
  - [ ] 7.2 Add getAllStudentsWithReferrals method for admin
    - Query all users where type="student"
    - For each student, fetch referral count and total points
    - Return array of StudentData objects
    - Implement pagination (20 students per page)
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 8. Integrate referral rewards with mission system
  - [ ] 8.1 Add checkReferralReward method to missionsService
    - Check if user has referredBy field
    - Identify mission level (level 1 or level 2)
    - Query referrals collection to find referral record
    - Check if points already awarded for this mission level
    - Call referralService.awardReferralPoints if eligible
    - _Requirements: 5.1, 6.1_
  
  - [ ]* 8.2 Write property test for referral identification
    - **Property 14: Referral identification on mission completion**
    - **Validates: Requirements 5.1, 6.1**
  
  - [ ] 8.3 Implement awardReferralPoints method in referralService.js
    - Validate referral exists and points not already awarded
    - Award 30 points for level 1 mission completion
    - Award 20 points for level 2 mission completion
    - For level 2, verify level 1 was completed first
    - Update student's userMissions document with points
    - Create transaction record in referralPoints collection
    - Update referral document with completion flags and timestamps
    - _Requirements: 5.2, 5.4, 5.5, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 8.4 Write property tests for points awards
    - **Property 15: Level 1 points award**
    - **Property 16: Level 2 points award**
    - **Property 17: Points award idempotence**
    - **Property 18: Level 2 prerequisite**
    - **Property 19: Points transaction recording**
    - **Validates: Requirements 5.2, 5.4, 5.5, 6.2, 6.3, 6.4, 6.5**
  
  - [ ] 8.5 Hook checkReferralReward into mission completion flow
    - Find where missions are marked complete in existing code
    - Add call to checkReferralReward after mission completion
    - Ensure it runs asynchronously without blocking mission completion
    - Add error handling to prevent mission completion failures
    - _Requirements: 5.1, 6.1_

- [ ] 9. Checkpoint - Ensure mission rewards work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Create admin dashboard for student referrals
  - [ ] 10.1 Create AdminStudentReferrals component
    - Create component at `src/features/admin/components/AdminStudentReferrals.js`
    - Display table with columns: Name, University, Points, Referrals
    - Fetch student data using referralService.getAllStudentsWithReferrals()
    - Use Ant Design Table component for display
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 10.2 Add filtering and sorting to AdminStudentReferrals
    - Add university filter dropdown
    - Implement filter logic to show only students from selected university
    - Add sort controls for points and referrals columns
    - Implement sort logic (descending order)
    - _Requirements: 7.6, 7.7_
  
  - [ ]* 10.3 Write property tests for admin filtering and sorting
    - **Property 20: Admin dashboard university filtering**
    - **Property 21: Admin dashboard points sorting**
    - **Validates: Requirements 7.6, 7.7**
  
  - [ ] 10.4 Add student detail view to AdminStudentReferrals
    - Implement row click handler to select student
    - Create detail panel showing referred users list with names
    - Display mission completion status for each referral
    - Show points transaction history with timestamps
    - Use Ant Design Drawer or Modal for detail view
    - _Requirements: 7.4, 7.5, 7.8_
  
  - [ ]* 10.5 Write property tests for admin detail display
    - **Property 22: Admin student details display**
    - **Property 23: Admin transaction history display**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.8**
  
  - [ ] 10.6 Integrate AdminStudentReferrals into admin dashboard
    - Add new tab or section in existing admin dashboard
    - Ensure only admin users can access (check admin permissions)
    - Add route for admin referrals page if needed
    - Lazy load component for code splitting
    - _Requirements: 7.1_

- [ ] 11. Update Firestore security rules
  - [ ] 11.1 Add security rules for referrals collection
    - Allow students to read their own referrals
    - Restrict write access to admin only
    - Add validation rules for required fields
    - _Requirements: 9.6_
  
  - [ ] 11.2 Add security rules for referralPoints collection
    - Allow students to read their own transactions
    - Restrict write access to admin only
    - Add validation rules for transaction data
    - _Requirements: 5.5, 6.4_
  
  - [ ] 11.3 Update users collection rules for referral codes
    - Allow authenticated users to read referral codes for validation
    - Maintain existing write restrictions
    - _Requirements: 8.3_

- [ ] 12. Final integration and polish
  - [ ] 12.1 Add error handling throughout the system
    - Add try-catch blocks with Vietnamese error messages
    - Implement retry logic with exponential backoff for database operations
    - Add user-friendly error displays in UI components
    - Log errors for admin review
    - _Requirements: All_
  
  - [ ] 12.2 Add loading states and optimistic updates
    - Add loading spinners for async operations
    - Implement optimistic UI updates for copy actions
    - Add skeleton loaders for statistics
    - _Requirements: All_
  
  - [ ] 12.3 Optimize performance
    - Implement caching for referral statistics (5-minute TTL)
    - Add pagination for admin dashboard
    - Lazy load QR code library
    - Use Firestore offline persistence
    - _Requirements: All_

- [ ] 13. Final checkpoint - Comprehensive testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation follows the phased approach from the design document
- Vietnamese error messages should be used throughout for consistency with existing app
- All database operations should include error handling and retry logic
- QR code library (qrcode.react) needs to be added to package.json
- Firestore security rules must be updated before deploying to production
- Property tests use fast-check library with minimum 100 iterations
- Integration with existing mission system requires careful testing to avoid breaking changes
