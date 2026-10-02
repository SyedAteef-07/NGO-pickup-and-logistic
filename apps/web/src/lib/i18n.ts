import { useEffect } from 'react'

export type Language = 'en' | 'kn'

// The English UI remains the source text. This layer changes only rendered copy;
// option values, IDs, names and the volunteer/assignment data stay untouched.
const kannada: Record<string, string> = {
  'Food Rescue Network':'ಆಹಾರ ರಕ್ಷಣಾ ಜಾಲ', 'AaharaConnect · Food Rescue Network':'AaharaConnect · ಆಹಾರ ರಕ್ಷಣಾ ಜಾಲ', 'WORKSPACE':'ಕಾರ್ಯಕ್ಷೇತ್ರ', 'Workspace':'ಕಾರ್ಯಕ್ಷೇತ್ರ',
  'Dashboard':'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'Volunteers':'ಸ್ವಯಂಸೇವಕರು', 'Teams':'ತಂಡಗಳು', 'Assignments':'ನಿಯೋಜನೆಗಳು', 'Settings':'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  'Volunteer Management':'ಸ್ವಯಂಸೇವಕರ ನಿರ್ವಹಣೆ', 'Volunteer Teams':'ಸ್ವಯಂಸೇವಕ ತಂಡಗಳು', 'Bengaluru Chapter':'Bengaluru ಘಟಕ',
  'NGO Coordinator':'ಎನ್‌ಜಿಒ ಸಂಯೋಜಕರು', 'Coordinator':'ಸಂಯೋಜಕರು', 'Notifications':'ಅಧಿಸೂಚನೆಗಳು', 'Workspace settings':'ಕಾರ್ಯಕ್ಷೇತ್ರ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  'You’re all caught up. Assignment updates will appear here during your session.':'ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ. ಈ ಅವಧಿಯ ನಿಯೋಜನೆ ಬದಲಾವಣೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
  'Open navigation':'ನ್ಯಾವಿಗೇಶನ್ ತೆರೆಯಿರಿ', 'Close navigation':'ನ್ಯಾವಿಗೇಶನ್ ಮುಚ್ಚಿರಿ', 'Main navigation':'ಮುಖ್ಯ ನ್ಯಾವಿಗೇಶನ್', 'Language':'ಭಾಷೆ', 'Expand sidebar':'ಪಕ್ಕದ ಪಟ್ಟಿಯನ್ನು ವಿಸ್ತರಿಸಿ', 'Collapse sidebar':'ಪಕ್ಕದ ಪಟ್ಟಿಯನ್ನು ಕುಗ್ಗಿಸಿ', 'Expand':'ವಿಸ್ತರಿಸಿ', 'Collapse':'ಕುಗ್ಗಿಸಿ', 'sidebar':'ಪಕ್ಕದ ಪಟ್ಟಿ',
  'Close dialog':'ಸಂವಾದ ಮುಚ್ಚಿರಿ', 'Close details':'ವಿವರಗಳನ್ನು ಮುಚ್ಚಿರಿ', 'Dismiss notification':'ಅಧಿಸೂಚನೆ ಮುಚ್ಚಿರಿ',
  'Every meal matters.':'ಪ್ರತಿ ಊಟವೂ ಮುಖ್ಯ.', 'People and purpose, working together for a better Bengaluru.':'ಉತ್ತಮ Bengaluru ಗಾಗಿ ಜನರು ಒಟ್ಟಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದಾರೆ.',
  'MONDAY, 28 SEPTEMBER 2026':'ಸೋಮವಾರ, 28 ಸೆಪ್ಟೆಂಬರ್ 2026', 'Coordinate volunteers, teams and food-rescue assignments.':'ಸ್ವಯಂಸೇವಕರು, ತಂಡಗಳು ಮತ್ತು ಆಹಾರ ರಕ್ಷಣಾ ನಿಯೋಜನೆಗಳನ್ನು ಸಂಯೋಜಿಸಿ.',
  'Create Assignment':'ನಿಯೋಜನೆ ರಚಿಸಿ', 'Total Volunteers':'ಒಟ್ಟು ಸ್ವಯಂಸೇವಕರು', 'Available Volunteers':'ಲಭ್ಯ ಸ್ವಯಂಸೇವಕರು', 'On Assignment':'ನಿಯೋಜನೆಯಲ್ಲಿ', 'Active Teams':'ಸಕ್ರಿಯ ತಂಡಗಳು',
  'Across Bengaluru chapter':'Bengaluru ಘಟಕದಾದ್ಯಂತ', 'Ready for a pickup':'ಆಹಾರ ಸಂಗ್ರಹಕ್ಕೆ ಸಿದ್ಧ', 'Supporting active pickups':'ಸಕ್ರಿಯ ಸಂಗ್ರಹಕ್ಕೆ ನೆರವು', 'Coordinated crews':'ಸಂಯೋಜಿತ ತಂಡಗಳು',
  'Today’s Volunteer Operations':'ಇಂದಿನ ಸ್ವಯಂಸೇವಕ ಕಾರ್ಯಗಳು', 'The next pickups your crews are coordinating.':'ನಿಮ್ಮ ತಂಡಗಳು ಸಂಯೋಜಿಸುತ್ತಿರುವ ಮುಂದಿನ ಆಹಾರ ಸಂಗ್ರಹಗಳು.',
  'All assignments':'ಎಲ್ಲ ನಿಯೋಜನೆಗಳು', 'View':'ವೀಕ್ಷಿಸಿ', 'View all':'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ', 'Volunteer / Team':'ಸ್ವಯಂಸೇವಕ / ತಂಡ', 'Assignment':'ನಿಯೋಜನೆ', 'Role':'ಪಾತ್ರ', 'Pickup Time':'ಸಂಗ್ರಹ ಸಮಯ', 'Pickup':'ಸಂಗ್ರಹ', 'Status':'ಸ್ಥಿತಿ', 'Actions':'ಕ್ರಿಯೆಗಳು',
  'Individual volunteer':'ವೈಯಕ್ತಿಕ ಸ್ವಯಂಸೇವಕ', 'Volunteer Availability Overview':'ಸ್ವಯಂಸೇವಕರ ಲಭ್ಯತೆ', 'Current roster state.':'ಪ್ರಸ್ತುತ ಪಟ್ಟಿಯ ಸ್ಥಿತಿ.', 'Volunteer availability':'ಸ್ವಯಂಸೇವಕರ ಲಭ್ಯತೆ', 'View roster':'ಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ', 'A quick view of today’s people capacity.':'ಇಂದು ಲಭ್ಯವಿರುವ ಜನರ ಸಂಕ್ಷಿಪ್ತ ನೋಟ.', 'available volunteers':'ಲಭ್ಯ ಸ್ವಯಂಸೇವಕರು', 'across the chapter':'ಘಟಕದಾದ್ಯಂತ',
  'Available':'ಲಭ್ಯ', 'Assigned':'ನಿಯೋಜಿತ', 'On duty':'ಕರ್ತವ್ಯದಲ್ಲಿ', 'On Duty':'ಕರ್ತವ್ಯದಲ್ಲಿ', 'Off Duty':'ಕರ್ತವ್ಯದಲ್ಲಿಲ್ಲ', 'Unavailable':'ಲಭ್ಯವಿಲ್ಲ', 'Not available':'ಲಭ್ಯವಿಲ್ಲ', 'Reserved':'ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ',
  'Pending':'ಬಾಕಿ', 'Accepted':'ಸ್ವೀಕರಿಸಲಾಗಿದೆ', 'In Progress':'ಪ್ರಗತಿಯಲ್ಲಿದೆ', 'Completed':'ಪೂರ್ಣಗೊಂಡಿದೆ', 'Rejected':'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ', 'Cancelled':'ರದ್ದಾಗಿದೆ', 'On Trip':'ಪ್ರಯಾಣದಲ್ಲಿದೆ', 'Maintenance':'ನಿರ್ವಹಣೆಯಲ್ಲಿ',
  'Next pickup window':'ಮುಂದಿನ ಸಂಗ್ರಹ ಸಮಯ', 'NEXT PICKUP WINDOW':'ಮುಂದಿನ ಸಂಗ್ರಹ ಸಮಯ', 'Approximately':'ಸುಮಾರು', 'meals':'ಊಟಗಳು', 'Coordinated with care by the Bengaluru volunteer team.':'Bengaluru ಸ್ವಯಂಸೇವಕ ತಂಡದ ಕಾಳಜಿಯ ಸಂಯೋಜನೆ.',
  'PEOPLE & CAPACITY':'ಜನರು ಮತ್ತು ಸಾಮರ್ಥ್ಯ', 'Manage NGO volunteers and their availability.':'ಎನ್‌ಜಿಒ ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ಅವರ ಲಭ್ಯತೆಯನ್ನು ನಿರ್ವಹಿಸಿ.', 'Add Volunteer':'ಸ್ವಯಂಸೇವಕರನ್ನು ಸೇರಿಸಿ',
  'People make every rescue possible':'ಪ್ರತಿ ಆಹಾರ ರಕ್ಷಣೆಗೆ ಜನರೇ ಶಕ್ತಿ', 'Keep profiles, availability and team membership up to date before assigning pickups.':'ಸಂಗ್ರಹ ಕಾರ್ಯ ನೀಡುವ ಮೊದಲು ಪ್ರೊಫೈಲ್, ಲಭ್ಯತೆ ಮತ್ತು ತಂಡದ ವಿವರಗಳನ್ನು ನವೀಕರಿಸಿ.',
  'Search volunteers by name, phone or email':'ಹೆಸರು, ಫೋನ್ ಅಥವಾ ಇಮೇಲ್ ಮೂಲಕ ಹುಡುಕಿ', 'Search volunteers':'ಸ್ವಯಂಸೇವಕರನ್ನು ಹುಡುಕಿ', 'Clear search':'ಹುಡುಕಾಟ ತೆರವುಗೊಳಿಸಿ',
  'Filter by status':'ಸ್ಥಿತಿಯ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ', 'Filter by availability':'ಲಭ್ಯತೆಯ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ', 'Filter by team':'ತಂಡದ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ', 'Filter by skill':'ಕೌಶಲ್ಯದ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ',
  'Filters':'ಫಿಲ್ಟರ್‌ಗಳು', 'All statuses':'ಎಲ್ಲ ಸ್ಥಿತಿಗಳು', 'Any availability':'ಯಾವುದೇ ಲಭ್ಯತೆ', 'Available now':'ಈಗ ಲಭ್ಯ', 'All teams':'ಎಲ್ಲ ತಂಡಗಳು', 'All skills':'ಎಲ್ಲ ಕೌಶಲ್ಯಗಳು', 'Unassigned':'ತಂಡವಿಲ್ಲ', 'Clear filters':'ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ',
  'Volunteer':'ಸ್ವಯಂಸೇವಕ', 'Contact':'ಸಂಪರ್ಕ', 'Skills':'ಕೌಶಲ್ಯಗಳು', 'Team':'ತಂಡ', 'Availability':'ಲಭ್ಯತೆ', 'Completed Jobs':'ಪೂರ್ಣಗೊಂಡ ಕಾರ್ಯಗಳು',
  'Food Handling':'ಆಹಾರ ನಿರ್ವಹಣೆ', 'Coordination':'ಸಂಯೋಜನೆ', 'Driving':'ಚಾಲನೆ', 'Distribution':'ವಿತರಣೆ', 'First Aid':'ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ', 'Event Support':'ಕಾರ್ಯಕ್ರಮ ನೆರವು',
  'Team Leader':'ತಂಡದ ನಾಯಕ', 'Driver':'ಚಾಲಕ', 'Pickup Volunteer':'ಸಂಗ್ರಹ ಸ್ವಯಂಸೇವಕ', 'Food Handling Volunteer':'ಆಹಾರ ನಿರ್ವಹಣೆ ಸ್ವಯಂಸೇವಕ', 'Distribution Volunteer':'ವಿತರಣಾ ಸ್ವಯಂಸೇವಕ',
  'View profile':'ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ', 'Edit volunteer':'ಸ್ವಯಂಸೇವಕರನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಿ', 'Assign to team':'ತಂಡಕ್ಕೆ ಸೇರಿಸಿ', 'Create assignment':'ನಿಯೋಜನೆ ರಚಿಸಿ',
  'No volunteers found':'ಸ್ವಯಂಸೇವಕರು ಕಂಡುಬಂದಿಲ್ಲ', 'Try a different search or clear the filters to see more people.':'ಬೇರೆ ಪದದಿಂದ ಹುಡುಕಿ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ.', 'Clear search and filters':'ಹುಡುಕಾಟ ಮತ್ತು ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ',
  'Volunteer roster · Bengaluru chapter':'ಸ್ವಯಂಸೇವಕರ ಪಟ್ಟಿ · Bengaluru ಘಟಕ', 'Volunteer profile':'ಸ್ವಯಂಸೇವಕರ ಪ್ರೊಫೈಲ್', 'Edit Volunteer':'ಸ್ವಯಂಸೇವಕರನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಿ', 'Assign to Team':'ತಂಡಕ್ಕೆ ಸೇರಿಸಿ', 'Showing':'ತೋರಿಸಲಾಗುತ್ತಿದೆ', 'of':'/', 'volunteers':'ಸ್ವಯಂಸೇವಕರು', 'profiles':'ಪ್ರೊಫೈಲ್‌ಗಳು', 'result':'ಫಲಿತಾಂಶ', 'results':'ಫಲಿತಾಂಶಗಳು',
  'Volunteer details':'ಸ್ವಯಂಸೇವಕರ ವಿವರಗಳು', 'Phone':'ಫೋನ್', 'Email':'ಇಮೇಲ್', 'Joined':'ಸೇರಿದ ದಿನ', 'Completed assignments':'ಪೂರ್ಣಗೊಂಡ ನಿಯೋಜನೆಗಳು', 'Volunteer hours':'ಸ್ವಯಂಸೇವಕ ಗಂಟೆಗಳು', 'Rating':'ಮೌಲ್ಯಮಾಪನ',
  'Upcoming availability':'ಮುಂಬರುವ ಲಭ್ಯತೆ', 'Add slot':'ಸಮಯ ಸೇರಿಸಿ', 'Start':'ಆರಂಭ', 'End':'ಅಂತ್ಯ', 'Save availability':'ಲಭ್ಯತೆಯನ್ನು ಉಳಿಸಿ', 'Current assignment':'ಪ್ರಸ್ತುತ ನಿಯೋಜನೆ', 'No active assignment right now.':'ಈಗ ಸಕ್ರಿಯ ನಿಯೋಜನೆ ಇಲ್ಲ.',
  'Recent assignment history':'ಇತ್ತೀಚಿನ ನಿಯೋಜನೆಗಳು', 'No recent assignment history.':'ಇತ್ತೀಚಿನ ನಿಯೋಜನೆಗಳಿಲ್ಲ.',
  'Add a volunteer':'ಸ್ವಯಂಸೇವಕರನ್ನು ಸೇರಿಸಿ', 'Add a person to the Bengaluru volunteer roster.':'Bengaluru ಸ್ವಯಂಸೇವಕರ ಪಟ್ಟಿಗೆ ವ್ಯಕ್ತಿಯನ್ನು ಸೇರಿಸಿ.', 'Update this volunteer’s profile and team.':'ಈ ಸ್ವಯಂಸೇವಕರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ತಂಡವನ್ನು ನವೀಕರಿಸಿ.',
  'Full name':'ಪೂರ್ಣ ಹೆಸರು', 'e.g. Kavya Iyer':'ಉದಾ. Kavya Iyer', 'e.g. Team Echo':'ಉದಾ. Team Echo', 'name@example.com':'name@example.com',
  'No team':'ತಂಡವಿಲ್ಲ', 'Cancel':'ರದ್ದುಮಾಡಿ', 'Save Changes':'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ', 'Select at least one skill.':'ಕನಿಷ್ಠ ಒಂದು ಕೌಶಲ್ಯ ಆಯ್ಕೆಮಾಡಿ.',
  'Please complete name, phone and email.':'ಹೆಸರು, ಫೋನ್ ಮತ್ತು ಇಮೇಲ್ ಭರ್ತಿ ಮಾಡಿ.', 'Enter a valid email address.':'ಸರಿಯಾದ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ.', 'Volunteer profile updated successfully.':'ಸ್ವಯಂಸೇವಕರ ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲಾಗಿದೆ.', 'Volunteer added successfully.':'ಸ್ವಯಂಸೇವಕರನ್ನು ಸೇರಿಸಲಾಗಿದೆ.',
  'Volunteer assigned to team.':'ಸ್ವಯಂಸೇವಕರನ್ನು ತಂಡಕ್ಕೆ ಸೇರಿಸಲಾಗಿದೆ.', 'Volunteer removed from team.':'ಸ್ವಯಂಸೇವಕರನ್ನು ತಂಡದಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.', 'Availability added successfully.':'ಲಭ್ಯತೆಯನ್ನು ಸೇರಿಸಲಾಗಿದೆ.', 'Choose an end time after the start time.':'ಆರಂಭದ ನಂತರದ ಅಂತ್ಯ ಸಮಯ ಆಯ್ಕೆಮಾಡಿ.',
  'Keep this volunteer unassigned':'ಈ ಸ್ವಯಂಸೇವಕರನ್ನು ತಂಡವಿಲ್ಲದೆ ಇರಿಸಿ',
  'PEOPLE WORKING TOGETHER':'ಒಟ್ಟಾಗಿ ಕೆಲಸ ಮಾಡುವ ಜನರು', 'Build reliable crews for every food rescue.':'ಪ್ರತಿ ಆಹಾರ ರಕ್ಷಣೆಗೆ ವಿಶ್ವಾಸಾರ್ಹ ತಂಡಗಳನ್ನು ರಚಿಸಿ.', 'Create Team':'ತಂಡ ರಚಿಸಿ',
  'Stronger together':'ಒಟ್ಟಾಗಿ ಇನ್ನಷ್ಟು ಬಲ', 'Teams bring the right mix of people and skills to each pickup. Open a team to manage its members and leader.':'ಪ್ರತಿ ಸಂಗ್ರಹಕ್ಕೆ ಸೂಕ್ತ ಜನರು ಮತ್ತು ಕೌಶಲ್ಯಗಳನ್ನು ತಂಡಗಳು ಒಟ್ಟುಗೂಡಿಸುತ್ತವೆ. ಸದಸ್ಯರು ಮತ್ತು ನಾಯಕರನ್ನು ನಿರ್ವಹಿಸಲು ತಂಡವನ್ನು ತೆರೆಯಿರಿ.',
  'TEAM LEADER':'ತಂಡದ ನಾಯಕ', 'Members':'ಸದಸ್ಯರು', 'members':'ಸದಸ್ಯರು', 'members ·':'ಸದಸ್ಯರು ·', 'currently available':'ಈಗ ಲಭ್ಯ', 'active teams':'ಸಕ್ರಿಯ ತಂಡಗಳು', 'View Team':'ತಂಡ ವೀಕ್ಷಿಸಿ', 'Team details':'ತಂಡದ ವಿವರಗಳು', 'Coordinate membership and leadership for upcoming pickups.':'ಮುಂಬರುವ ಸಂಗ್ರಹಗಳಿಗೆ ಸದಸ್ಯರು ಮತ್ತು ನಾಯಕರನ್ನು ಸಂಯೋಜಿಸಿ.',
  'Leader':'ನಾಯಕ', 'Team members':'ತಂಡದ ಸದಸ್ಯರು', 'Add member':'ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ', 'Select volunteer':'ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  '· moves from current team':'· ಪ್ರಸ್ತುತ ತಂಡದಿಂದ ಸ್ಥಳಾಂತರಿಸಿ', 'Move from another team':'ಬೇರೆ ತಂಡದಿಂದ ಸ್ಥಳಾಂತರಿಸಿ', 'Available for assignment':'ನಿಯೋಜನೆಗೆ ಲಭ್ಯ',
  'Leadership':'ನಾಯಕತ್ವ', 'A team leader is responsible for coordinating the crew at pickup.':'ಸಂಗ್ರಹ ಸ್ಥಳದಲ್ಲಿ ತಂಡವನ್ನು ಸಂಯೋಜಿಸುವುದು ತಂಡದ ನಾಯಕನ ಜವಾಬ್ದಾರಿ.', 'Change Leader':'ನಾಯಕರನ್ನು ಬದಲಿಸಿ', 'Add another member before changing the leader.':'ನಾಯಕರನ್ನು ಬದಲಿಸುವ ಮೊದಲು ಮತ್ತೊಬ್ಬ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ.',
  'Create a team':'ತಂಡ ರಚಿಸಿ', 'Start a new volunteer crew for Bengaluru pickups.':'Bengaluru ಸಂಗ್ರಹಗಳಿಗಾಗಿ ಹೊಸ ಸ್ವಯಂಸೇವಕ ತಂಡ ರಚಿಸಿ.', 'Team name':'ತಂಡದ ಹೆಸರು', 'Team leader':'ತಂಡದ ನಾಯಕ', 'Select a volunteer':'ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ', 'You can add more members after creating the team.':'ತಂಡ ರಚಿಸಿದ ನಂತರ ಹೆಚ್ಚಿನ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಬಹುದು.',
  'Add a team name and select a leader.':'ತಂಡದ ಹೆಸರು ಮತ್ತು ನಾಯಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ.', 'A team with this name already exists.':'ಈ ಹೆಸರಿನ ತಂಡ ಈಗಾಗಲೇ ಇದೆ.', 'Team created successfully.':'ತಂಡವನ್ನು ರಚಿಸಲಾಗಿದೆ.', 'Team member removed.':'ತಂಡದ ಸದಸ್ಯರನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.', 'Team leader updated.':'ತಂಡದ ನಾಯಕ ನವೀಕರಿಸಲಾಗಿದೆ.', 'Member added to team.':'ಸದಸ್ಯರನ್ನು ತಂಡಕ್ಕೆ ಸೇರಿಸಲಾಗಿದೆ.',
  'FOOD RESCUE PICKUPS':'ಆಹಾರ ರಕ್ಷಣಾ ಸಂಗ್ರಹಗಳು', 'Match volunteers and teams with upcoming rescue pickups.':'ಮುಂಬರುವ ಆಹಾರ ಸಂಗ್ರಹಗಳಿಗೆ ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ತಂಡಗಳನ್ನು ಹೊಂದಿಸಿ.',
  'Pending response':'ಪ್ರತಿಕ್ರಿಯೆ ಬಾಕಿ', 'Active assignments':'ಸಕ್ರಿಯ ನಿಯೋಜನೆಗಳು', 'Completed pickups':'ಪೂರ್ಣಗೊಂಡ ಸಂಗ್ರಹಗಳು', 'All':'ಎಲ್ಲ', 'Search assignments':'ನಿಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ', 'Assignment status':'ನಿಯೋಜನೆಯ ಸ್ಥಿತಿ', 'Assignment ID':'ನಿಯೋಜನೆ ID', 'Event':'ಕಾರ್ಯಕ್ರಮ', 'Vehicle':'ವಾಹನ', 'shown':'ತೋರಿಸಲಾಗಿದೆ',
  'View assignment':'ನಿಯೋಜನೆ ವೀಕ್ಷಿಸಿ', 'Mark accepted':'ಸ್ವೀಕರಿಸಿದಂತೆ ಗುರುತಿಸಿ', 'Mark in progress':'ಪ್ರಗತಿಯಲ್ಲಿದೆ ಎಂದು ಗುರುತಿಸಿ', 'Mark completed':'ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ', 'Cancel assignment':'ನಿಯೋಜನೆ ರದ್ದುಮಾಡಿ',
  'No assignments scheduled':'ನಿಯೋಜನೆಗಳಿಲ್ಲ', 'There are no assignments matching this view. Create a new pickup assignment or choose another status.':'ಈ ವೀಕ್ಷಣೆಗೆ ಹೊಂದುವ ನಿಯೋಜನೆಗಳಿಲ್ಲ. ಹೊಸ ನಿಯೋಜನೆ ರಚಿಸಿ ಅಥವಾ ಬೇರೆ ಸ್ಥಿತಿ ಆಯ್ಕೆಮಾಡಿ.',
  'Assignment records · Bengaluru chapter':'ನಿಯೋಜನೆ ದಾಖಲೆಗಳು · Bengaluru ಘಟಕ', 'Assignment details':'ನಿಯೋಜನೆಯ ವಿವರಗಳು', 'Pickup overview':'ಸಂಗ್ರಹ ವಿವರ', 'Expected meals':'ನಿರೀಕ್ಷಿತ ಊಟಗಳು', 'Registration':'ನೋಂದಣಿ ಸಂಖ್ಯೆ', 'Update status':'ಸ್ಥಿತಿ ನವೀಕರಿಸಿ', 'Track this assignment as the pickup progresses.':'ಸಂಗ್ರಹ ಮುಂದುವರಿದಂತೆ ನಿಯೋಜನೆಯ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಿ.', 'Cancel Assignment':'ನಿಯೋಜನೆ ರದ್ದುಮಾಡಿ',
  'Unable to update assignment. Please try again.':'ನಿಯೋಜನೆಯನ್ನು ನವೀಕರಿಸಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', 'Assignment cancelled.':'ನಿಯೋಜನೆ ರದ್ದಾಗಿದೆ.',
  'Match a pickup with the right people and resources.':'ಸಂಗ್ರಹಕ್ಕೆ ಸೂಕ್ತ ಜನರು ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳನ್ನು ಹೊಂದಿಸಿ.', 'Select Event':'ಕಾರ್ಯಕ್ರಮ ಆಯ್ಕೆ', 'Select Driver':'ಚಾಲಕ ಆಯ್ಕೆ', 'Select Vehicle':'ವಾಹನ ಆಯ್ಕೆ', 'Review':'ಪರಿಶೀಲನೆ',
  'Select a pickup event':'ಸಂಗ್ರಹ ಕಾರ್ಯಕ್ರಮ ಆಯ್ಕೆಮಾಡಿ', 'Choose the food rescue requirement this assignment will support.':'ಈ ನಿಯೋಜನೆಗೆ ಸಂಬಂಧಿಸಿದ ಆಹಾರ ರಕ್ಷಣಾ ಅಗತ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.', 'Available teams':'ಲಭ್ಯ ತಂಡಗಳು', 'Available volunteers':'ಲಭ್ಯ ಸ್ವಯಂಸೇವಕರು', 'Choose your volunteers':'ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ', 'Select an available team or an individual volunteer for':'ಲಭ್ಯ ತಂಡ ಅಥವಾ ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ:', 'Leader:':'ನಾಯಕ:', 'Assignment role':'ನಿಯೋಜನೆಯ ಪಾತ್ರ',
  'Select a driver':'ಚಾಲಕ ಆಯ್ಕೆಮಾಡಿ', 'Only available drivers with valid licences can be selected.':'ಮಾನ್ಯ ಪರವಾನಗಿ ಇರುವ ಲಭ್ಯ ಚಾಲಕರನ್ನು ಮಾತ್ರ ಆಯ್ಕೆಮಾಡಬಹುದು.', 'Licence valid':'ಪರವಾನಗಿ ಮಾನ್ಯವಾಗಿದೆ', 'Driver unavailable':'ಚಾಲಕ ಲಭ್ಯವಿಲ್ಲ', 'Driver licence expired':'ಚಾಲನಾ ಪರವಾನಗಿ ಅವಧಿ ಮುಗಿದಿದೆ', 'Drivers on a trip or with an expired licence are unavailable for new assignments.':'ಪ್ರಯಾಣದಲ್ಲಿರುವ ಅಥವಾ ಅವಧಿ ಮುಗಿದ ಪರವಾನಗಿ ಇರುವ ಚಾಲಕರಿಗೆ ಹೊಸ ನಿಯೋಜನೆ ನೀಡಲಾಗುವುದಿಲ್ಲ.',
  'Select a vehicle':'ವಾಹನ ಆಯ್ಕೆಮಾಡಿ', 'Choose a vehicle with enough capacity for the pickup.':'ಸಂಗ್ರಹಕ್ಕೆ ಸಾಕಷ್ಟು ಸಾಮರ್ಥ್ಯ ಇರುವ ವಾಹನ ಆಯ್ಕೆಮಾಡಿ.', 'Vehicle under maintenance':'ವಾಹನ ನಿರ್ವಹಣೆಯಲ್ಲಿದೆ', 'Currently on a trip':'ಈಗ ಪ್ರಯಾಣದಲ್ಲಿದೆ', 'Ready for pickup':'ಸಂಗ್ರಹಕ್ಕೆ ಸಿದ್ಧ',
  'Review assignment':'ನಿಯೋಜನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ', 'Confirm the pickup details before creating the assignment.':'ನಿಯೋಜನೆ ರಚಿಸುವ ಮೊದಲು ಸಂಗ್ರಹ ವಿವರಗಳನ್ನು ದೃಢಪಡಿಸಿ.', 'Ready to schedule':'ನಿಗದಿಪಡಿಸಲು ಸಿದ್ಧ', 'Food rescue pickup':'ಆಹಾರ ರಕ್ಷಣಾ ಸಂಗ್ರಹ', 'Pickup time':'ಸಂಗ್ರಹ ಸಮಯ', 'This assignment will be added with a':'ಈ ನಿಯೋಜನೆಯನ್ನು', 'status.':'ಸ್ಥಿತಿಯಲ್ಲಿ ಸೇರಿಸಲಾಗುತ್ತದೆ.', 'Back':'ಹಿಂದೆ', 'Continue':'ಮುಂದುವರಿಸಿ', 'Creating…':'ರಚಿಸಲಾಗುತ್ತಿದೆ…', 'Step':'ಹಂತ', 'of 5':'/ 5',
  'Choose an option before continuing.':'ಮುಂದುವರಿಯುವ ಮೊದಲು ಒಂದು ಆಯ್ಕೆಮಾಡಿ.', 'Cannot assign this volunteer. Volunteer already has another assignment during this time.':'ಈ ಸ್ವಯಂಸೇವಕರಿಗೆ ನಿಯೋಜನೆ ನೀಡಲಾಗುವುದಿಲ್ಲ. ಇದೇ ಸಮಯದಲ್ಲಿ ಮತ್ತೊಂದು ನಿಯೋಜನೆ ಇದೆ.', 'Complete each assignment step first.':'ಮೊದಲು ಎಲ್ಲಾ ನಿಯೋಜನೆ ಹಂತಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.', 'Assignment Created Successfully · Pending':'ನಿಯೋಜನೆ ರಚಿಸಲಾಗಿದೆ · ಬಾಕಿ',
  'Cannot assign this volunteer. They are not currently available.':'ಈ ಸ್ವಯಂಸೇವಕರಿಗೆ ನಿಯೋಜನೆ ನೀಡಲಾಗುವುದಿಲ್ಲ. ಅವರು ಈಗ ಲಭ್ಯವಿಲ್ಲ.',
  'Coordinator preferences':'ಸಂಯೋಜಕರ ಆದ್ಯತೆಗಳು', 'Coordinator preferences for this volunteer management demo.':'ಈ ಸ್ವಯಂಸೇವಕರ ನಿರ್ವಹಣಾ ಮಾದರಿಯ ಆದ್ಯತೆಗಳು.', 'Chapter information':'ಘಟಕದ ಮಾಹಿತಿ', 'The operational context shown throughout this prototype.':'ಈ ಮಾದರಿಯಲ್ಲಿ ತೋರಿಸುವ ಕಾರ್ಯಾಚರಣೆಯ ಮಾಹಿತಿ.', 'Organisation':'ಸಂಸ್ಥೆ', 'Chapter':'ಘಟಕ', 'Adjust how this local demo presents updates.':'ಈ ಸ್ಥಳೀಯ ಮಾದರಿಯಲ್ಲಿ ನವೀಕರಣಗಳನ್ನು ಹೇಗೆ ತೋರಿಸಬೇಕು ಎಂಬುದನ್ನು ಹೊಂದಿಸಿ.', 'Show success notifications':'ಯಶಸ್ಸಿನ ಅಧಿಸೂಚನೆಗಳನ್ನು ತೋರಿಸಿ', 'Confirm when local records are changed':'ಸ್ಥಳೀಯ ದಾಖಲೆಗಳು ಬದಲಾದಾಗ ತಿಳಿಸಿ', 'Volunteer, team and assignment changes are kept in this browser session.':'ಸ್ವಯಂಸೇವಕ, ತಂಡ ಮತ್ತು ನಿಯೋಜನೆ ಬದಲಾವಣೆಗಳು ಈ ಬ್ರೌಸರ್ ಅವಧಿಯಲ್ಲಿ ಮಾತ್ರ ಉಳಿಯುತ್ತವೆ.',
  'Administrator account':'ನಿರ್ವಾಹಕ ಖಾತೆ', 'Connect a verified account to the shared API.':'ಹಂಚಿಕೆಯ API ಗೆ ದೃಢೀಕರಿಸಿದ ಖಾತೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.', 'Live sign in is not configured on this device.':'ಈ ಸಾಧನದಲ್ಲಿ ನೇರ ಪ್ರವೇಶವನ್ನು ಹೊಂದಿಸಲಾಗಿಲ್ಲ.', 'API role':'API ಪಾತ್ರ', 'Password':'ಪಾಸ್‌ವರ್ಡ್', 'Sign in':'ಪ್ರವೇಶಿಸಿ', 'Signing in…':'ಪ್ರವೇಶಿಸಲಾಗುತ್ತಿದೆ…', 'Sign out':'ನಿರ್ಗಮಿಸಿ', 'Signed out.':'ನಿರ್ಗಮಿಸಲಾಗಿದೆ.', 'Could not sign out. Try again.':'ನಿರ್ಗಮಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', 'Could not restore the administrator session.':'ನಿರ್ವಾಹಕ ಅವಧಿಯನ್ನು ಮರುಸ್ಥಾಪಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.', 'Sign in failed or administrator access is unavailable.':'ಪ್ರವೇಶ ವಿಫಲವಾಗಿದೆ ಅಥವಾ ನಿರ್ವಾಹಕ ಅನುಮತಿ ಲಭ್ಯವಿಲ್ಲ.', 'Volunteer, team and assignment records remain demo data.':'ಸ್ವಯಂಸೇವಕ, ತಂಡ ಮತ್ತು ನಿಯೋಜನೆ ದಾಖಲೆಗಳು ಡೆಮೊ ಮಾಹಿತಿಯಾಗಿಯೇ ಇರುತ್ತವೆ.',
  'Wedding':'ವಿವಾಹ', 'Corporate Event':'ಕಾರ್ಪೊರೇಟ್ ಕಾರ್ಯಕ್ರಮ', 'Community Event':'ಸಮುದಾಯ ಕಾರ್ಯಕ್ರಮ', 'Reception':'ಸ್ವಾಗತ ಸಮಾರಂಭ', 'Campus Event':'ಕ್ಯಾಂಪಸ್ ಕಾರ್ಯಕ್ರಮ', 'Festival':'ಹಬ್ಬ',
}

function translateDynamic(value: string): string | undefined {
  let match: RegExpMatchArray | null
  if ((match = value.match(/^Showing (\d+) of (\d+) volunteers$/))) return `${match[1]} / ${match[2]} ಸ್ವಯಂಸೇವಕರು`
  if ((match = value.match(/^(\d+) profiles$/))) return `${match[1]} ಪ್ರೊಫೈಲ್‌ಗಳು`
  if ((match = value.match(/^(\d+) active teams$/))) return `${match[1]} ಸಕ್ರಿಯ ತಂಡಗಳು`
  if ((match = value.match(/^(\d+) members · (\d+) currently available$/))) return `${match[1]} ಸದಸ್ಯರು · ${match[2]} ಈಗ ಲಭ್ಯ`
  if ((match = value.match(/^(\d+) members$/))) return `${match[1]} ಸದಸ್ಯರು`
  if ((match = value.match(/^(\d+) results?$/))) return `${match[1]} ಫಲಿತಾಂಶಗಳು`
  if ((match = value.match(/^(\d+) shown$/))) return `${match[1]} ತೋರಿಸಲಾಗಿದೆ`
  if ((match = value.match(/^Step (\d+) of (\d+)$/))) return `ಹಂತ ${match[1]} / ${match[2]}`
  if ((match = value.match(/^STEP (\d+) \/ (\d+)$/))) return `ಹಂತ ${match[1]} / ${match[2]}`
  if ((match = value.match(/^Approximately (\d+) meals$/))) return `ಸುಮಾರು ${match[1]} ಊಟಗಳು`
  if ((match = value.match(/^(\d+) meals$/))) return `${match[1]} ಊಟಗಳು`
  if ((match = value.match(/^(\d+) team members$/))) return `${match[1]} ತಂಡದ ಸದಸ್ಯರು`
  if ((match = value.match(/^(\d+) kg$/))) return `${match[1]} ಕೆಜಿ`
  if ((match = value.match(/^Leader: (.+)$/))) return `ನಾಯಕ: ${match[1]}`
  if ((match = value.match(/^Choose a team for (.+)\.$/))) return `${match[1]} ಅವರನ್ನು ಸೇರಿಸಲು ತಂಡ ಆಯ್ಕೆಮಾಡಿ.`
  if ((match = value.match(/^Select an available team or an individual volunteer for (.+)\.$/))) return `${match[1]} ಗಾಗಿ ಲಭ್ಯ ತಂಡ ಅಥವಾ ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ.`
  if ((match = value.match(/^Assignment marked (.+)\.$/))) return `ನಿಯೋಜನೆಯ ಸ್ಥಿತಿ ${kannada[match[1].replace(/\b\w/g, c => c.toUpperCase())] ?? match[1]} ಆಗಿದೆ.`
  if ((match = value.match(/^Remove (.+)$/))) return `${match[1]} ಅವರನ್ನು ತೆಗೆದುಹಾಕಿ`
  if ((match = value.match(/^Actions for (.+)$/))) return `${match[1]} ಅವರ ಕ್ರಿಯೆಗಳು`
  if ((match = value.match(/^([A-Za-z ]+) · Move from another team$/))) return `${match[1]} · ಬೇರೆ ತಂಡದಿಂದ ಸ್ಥಳಾಂತರಿಸಿ`
  if ((match = value.match(/^([A-Za-z ]+) · Unassigned$/))) return `${match[1]} · ತಂಡವಿಲ್ಲ`
  if ((match = value.match(/^([A-Za-z ]+) · (\d+) kg$/))) return `${match[1]} · ${match[2]} ಕೆಜಿ`
  return undefined
}

export function localize(value: string, language: Language): string {
  if (language === 'en') return value
  const leading = value.match(/^\s*/)?.[0] ?? ''
  const trailing = value.match(/\s*$/)?.[0] ?? ''
  const clean = value.trim()
  if (!clean) return value
  const pieces = clean.split(', ')
  const listTranslation = pieces.length > 1 && pieces.every(piece => !!kannada[piece]) ? pieces.map(piece => kannada[piece]).join(', ') : undefined
  const titleCase = clean.replace(/\b\w/g, character => character.toUpperCase()).replace(/\B\w/g, character => character.toLowerCase())
  const statusTranslation = clean === clean.toUpperCase() && ['AVAILABLE','ASSIGNED','ON DUTY','OFF DUTY','UNAVAILABLE','PENDING','ACCEPTED','IN PROGRESS','COMPLETED','REJECTED','CANCELLED'].includes(clean) ? kannada[titleCase] : undefined
  return leading + (kannada[clean] ?? listTranslation ?? statusTranslation ?? translateDynamic(clean) ?? clean) + trailing
}

const textMemory = new WeakMap<Text, { original: string; rendered: string }>()
const attributeMemory = new WeakMap<Element, Map<string, { original: string; rendered: string }>>()

function syncText(node: Text, language: Language) {
  const current = node.nodeValue ?? ''
  let record = textMemory.get(node)
  if (!record || current !== record.rendered) { record = { original: current, rendered: current }; textMemory.set(node, record) }
  const next = localize(record.original, language)
  if (current !== next) node.nodeValue = next
  record.rendered = next
}

function syncAttributes(element: Element, language: Language) {
  let records = attributeMemory.get(element)
  if (!records) { records = new Map(); attributeMemory.set(element, records) }
  for (const name of ['placeholder', 'title', 'aria-label']) {
    const current = element.getAttribute(name)
    if (current === null) continue
    let record = records.get(name)
    if (!record || current !== record.rendered) { record = { original: current, rendered: current }; records.set(name, record) }
    const next = localize(record.original, language)
    if (current !== next) element.setAttribute(name, next)
    record.rendered = next
  }
}

function syncNode(node: Node, language: Language) {
  if (node.nodeType === Node.TEXT_NODE) { syncText(node as Text, language); return }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  const element = node as Element
  if (element.closest('[data-no-localize]') || ['SCRIPT', 'STYLE'].includes(element.tagName)) return
  syncAttributes(element, language)
  element.childNodes.forEach(child => syncNode(child, language))
}

export function useRenderedLanguage(language: Language) {
  useEffect(() => {
    document.documentElement.lang = language
    document.body.classList.toggle('lang-kn', language === 'kn')
    syncNode(document.body, language)
    const observer = new MutationObserver(changes => {
      for (const change of changes) {
        if (change.type === 'characterData') syncNode(change.target, language)
        else if (change.type === 'attributes') syncNode(change.target, language)
        else change.addedNodes.forEach(node => syncNode(node, language))
      }
    })
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] })
    return () => observer.disconnect()
  }, [language])
}
