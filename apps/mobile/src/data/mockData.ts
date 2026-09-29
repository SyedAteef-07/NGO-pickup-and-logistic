import { AvailabilitySlot, DonorProfile, DonorRequest, VolunteerAssignment, VolunteerProfile } from '../types';
export const volunteerProfile: VolunteerProfile = {
  name: 'Arjun Rao', email: 'arjun@example.com', phone: '9876543210', registration: 'VOL-001',
  emergencyName: 'Meera Rao', emergencyPhone: '9876500011',
};
export const donorProfile: DonorProfile = {
  name: 'Ananya Sharma', organization: 'Sharma Wedding', email: 'ananya@example.com',
  phone: '9876501234', address: 'Royal Convention Hall, Jayanagar, Bengaluru',
};
export const initialAssignments: VolunteerAssignment[] = [
  { id: 'ASG-001', event: 'Sharma Wedding', date: '2026-09-30', time: '10:30 PM',
    address: 'Royal Convention Hall, Jayanagar, Bengaluru', distance: '5.4 km', role: 'Pickup Volunteer',
    team: 'Team Alpha', leader: 'Priya Sharma', members: ['Arjun Rao', 'Priya Sharma', 'Sanjay Verma'],
    driver: 'Ramesh Kumar', driverPhone: '9876500042', vehicle: 'Van 02',
    vehicleNumber: 'KA-09-AB-2048', capacity: '250 kg', status: 'Pending',
    notes: 'Meet the team at the main entrance. Confirm food packaging before loading.' },
  { id: 'ASG-002', event: 'TechCorp Annual Event', date: '2026-10-02', time: '9:45 PM',
    address: 'TechCorp Campus, Koramangala, Bengaluru', distance: '7.2 km', role: 'Food Handling Volunteer',
    team: 'Team Alpha', leader: 'Priya Sharma', members: ['Arjun Rao', 'Priya Sharma'],
    driver: 'Ramesh Kumar', driverPhone: '9876500042', vehicle: 'Van 02',
    vehicleNumber: 'KA-09-AB-2048', capacity: '250 kg', status: 'Accepted', notes: 'Use the service entrance.' },
  { id: 'ASG-003', event: 'Community Food Drive', date: '2026-09-22', time: '8:00 PM',
    address: 'Jayanagar 4th Block Grounds, Bengaluru', distance: '3.1 km', role: 'Distribution Volunteer',
    team: 'Team Bravo', leader: 'Kiran Reddy', members: ['Arjun Rao', 'Kiran Reddy'],
    driver: 'Ramesh Kumar', driverPhone: '9876500042', vehicle: 'Van 01',
    vehicleNumber: 'KA-03-CD-1122', capacity: '200 kg', status: 'Completed', notes: '' },
];
export const initialAvailability: AvailabilitySlot[] = [
  { id: 'SLOT-001', date: '2026-09-30', start: '6:00 PM', end: '11:00 PM' },
  { id: 'SLOT-002', date: '2026-10-02', start: '5:00 PM', end: '10:00 PM' },
];
export const initialRequests: DonorRequest[] = [
  { id: 'REQ-007', source: 'Sharma Wedding', sourceType: 'Wedding', address: 'Royal Convention Hall, Jayanagar, Bengaluru',
    date: '2026-09-30', time: '10:30 PM', foodType: 'Vegetarian meals', meals: '120', readyTime: '10:00 PM',
    contactName: 'Ananya Sharma', phone: '9876501234', notes: 'Collect from the kitchen entrance.',
    status: 'Assigned', event: 'Sharma Wedding', createdAt: '2026-09-28' },
  { id: 'REQ-006', source: 'Sharma Wedding', sourceType: 'Event', address: 'Royal Convention Hall, Jayanagar, Bengaluru',
    date: '2026-09-20', time: '8:00 PM', foodType: 'Packed meals', meals: '85', readyTime: '7:30 PM',
    contactName: 'Ananya Sharma', phone: '9876501234', notes: '', status: 'Completed',
    event: 'Community Service Dinner', createdAt: '2026-09-19' },
];
