
import { Complaint, Comment, ComplaintStatus } from './types';

// Helper to create past dates
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Generate mock comments
const generateMockComments = (complaintId: string, count: number = 1): Comment[] => {
  const comments: Comment[] = [];
  
  for (let i = 0; i < count; i++) {
    const isAdmin = i % 2 === 0;
    comments.push({
      id: `comment-${complaintId}-${i}`,
      complaintId,
      userId: isAdmin ? 'admin-1' : 'student-1',
      userName: isAdmin ? 'Admin User' : 'John Student',
      userRole: isAdmin ? 'admin' : 'student',
      content: isAdmin 
        ? 'Thank you for reporting this issue. We are looking into it and will get back to you soon.' 
        : 'I have provided all the details. Please let me know if you need any additional information.',
      createdAt: daysAgo(i + 1),
    });
  }
  
  return comments;
};

// Mock complaints data
export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    title: 'Poor Wi-Fi connectivity in Engineering block',
    description: 'The Wi-Fi network in the Engineering department building has been extremely slow and unreliable for the past two weeks. It affects our ability to access online resources for classes and submit assignments on time.',
    category: 'infrastructure',
    status: 'in-progress',
    priority: 'high',
    studentId: 'STU1234',
    studentName: 'John Student',
    department: 'Computer Science',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(12),
    comments: generateMockComments('c1', 3),
    assignedTo: 'IT Department',
  },
  {
    id: 'c2',
    title: 'Issue with online fee payment portal',
    description: 'I tried to pay my semester fees using the college payment portal, but the transaction failed multiple times. However, the amount was debited from my account. I\'ve contacted the bank, and they confirmed the deduction.',
    category: 'administrative',
    status: 'resolved',
    priority: 'high',
    studentId: 'STU1234',
    studentName: 'John Student',
    department: 'Computer Science',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(25),
    comments: generateMockComments('c2', 4),
    assignedTo: 'Finance Department',
    resolvedAt: daysAgo(25),
  },
  {
    id: 'c3',
    title: 'Inadequate lighting in Library section B',
    description: 'The lighting in section B of the main library is insufficient for reading, especially during evening hours. Several bulbs are not working, and it\'s causing eye strain for students who study there.',
    category: 'infrastructure',
    status: 'pending',
    priority: 'medium',
    studentId: 'STU1234',
    studentName: 'John Student',
    department: 'Computer Science',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    comments: generateMockComments('c3', 1),
  },
  {
    id: 'c4',
    title: 'Missing attendance records for Database Systems course',
    description: 'My attendance for the Database Systems course (CS401) doesn\'t reflect several classes I attended in the last month. I\'ve been marked absent for at least 5 classes that I attended and signed the attendance sheet.',
    category: 'academic',
    status: 'rejected',
    priority: 'medium',
    studentId: 'STU1234',
    studentName: 'John Student',
    department: 'Computer Science',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(40),
    comments: generateMockComments('c4', 2),
    rejectionReason: 'After reviewing the attendance records and consulting with the professor, we found that the attendance was correctly recorded. The days in question were holidays as per the academic calendar.',
  },
  {
    id: 'c5',
    title: 'Cafeteria food quality concerns',
    description: 'The quality of food in the main cafeteria has deteriorated significantly in the past month. Several students, including myself, have experienced stomach issues after consuming meals from there. I request an inspection of the food preparation and storage conditions.',
    category: 'canteen',
    status: 'in-progress',
    priority: 'high',
    studentId: 'STU1234',
    studentName: 'John Student',
    department: 'Computer Science',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(8),
    comments: generateMockComments('c5', 3),
    assignedTo: 'Canteen Management',
  },
  {
    id: 'c6',
    title: 'Request for additional bus stop near North Campus',
    description: 'Many students living in the North Campus housing area have to walk over a kilometer to reach the nearest college bus stop. We request the administration to consider adding a bus stop closer to the North Campus residential area, especially considering the safety concerns during late evening classes.',
    category: 'transport',
    status: 'pending',
    priority: 'low',
    studentId: 'STU1234',
    studentName: 'John Student',
    department: 'Computer Science',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    comments: generateMockComments('c6', 1),
  },
  {
    id: 'c7',
    title: 'Delay in issuing internship certificates',
    description: 'I completed my summer internship two months ago, but I haven\'t received my internship completion certificate yet. This is causing issues as I need to include it in my job applications.',
    category: 'administrative',
    status: 'resolved',
    priority: 'medium',
    studentId: 'STU1234',
    studentName: 'John Student',
    department: 'Computer Science',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(55),
    comments: generateMockComments('c7', 3),
    assignedTo: 'Career Development Cell',
    resolvedAt: daysAgo(55),
  },
];

// Filter functions for complaints
export const filterComplaintsByStatus = (complaints: Complaint[], status?: string) => {
  if (!status || status === 'all') return complaints;
  return complaints.filter(complaint => complaint.status === status);
};

export const filterComplaintsByCategory = (complaints: Complaint[], category?: string) => {
  if (!category || category === 'all') return complaints;
  return complaints.filter(complaint => complaint.category === category);
};

export const filterComplaintsByStudentId = (complaints: Complaint[], studentId: string) => {
  return complaints.filter(complaint => complaint.studentId === studentId);
};

export const sortComplaints = (complaints: Complaint[], sortBy: string) => {
  switch (sortBy) {
    case 'newest':
      return [...complaints].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case 'oldest':
      return [...complaints].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case 'priority-high':
      return [...complaints].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    case 'priority-low':
      return [...complaints].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    default:
      return complaints;
  }
};

// Get a complaint by ID
export const getComplaintById = (complaintId: string): Complaint | undefined => {
  return MOCK_COMPLAINTS.find(complaint => complaint.id === complaintId);
};

// Add a new comment to a complaint
export const addCommentToComplaint = (complaintId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Comment => {
  const newComment: Comment = {
    ...comment,
    id: `comment-${complaintId}-${Date.now()}`,
    createdAt: new Date(),
  };
  
  const complaintIndex = MOCK_COMPLAINTS.findIndex(c => c.id === complaintId);
  if (complaintIndex >= 0) {
    MOCK_COMPLAINTS[complaintIndex].comments.push(newComment);
    MOCK_COMPLAINTS[complaintIndex].updatedAt = new Date();
  }
  
  return newComment;
};

// Update complaint status
export const updateComplaintStatus = (
  complaintId: string, 
  status: ComplaintStatus, 
  additionalData?: {
    rejectionReason?: string;
    assignedTo?: string;
    resolvedAt?: Date;
  }
): Complaint | undefined => {
  const complaintIndex = MOCK_COMPLAINTS.findIndex(c => c.id === complaintId);
  
  if (complaintIndex >= 0) {
    const complaint = MOCK_COMPLAINTS[complaintIndex];
    
    MOCK_COMPLAINTS[complaintIndex] = {
      ...complaint,
      status,
      updatedAt: new Date(),
      ...(status === 'rejected' && additionalData?.rejectionReason ? 
          { rejectionReason: additionalData.rejectionReason } : {}),
      ...(status === 'in-progress' && additionalData?.assignedTo ? 
          { assignedTo: additionalData.assignedTo } : {}),
      ...(status === 'resolved' ? 
          { resolvedAt: additionalData?.resolvedAt || new Date() } : {}),
    };
    
    return MOCK_COMPLAINTS[complaintIndex];
  }
  
  return undefined;
};

// Add a new complaint
export const addComplaint = (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Complaint => {
  const newComplaint: Complaint = {
    ...complaint,
    id: `c${MOCK_COMPLAINTS.length + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
  };
  
  MOCK_COMPLAINTS.push(newComplaint);
  return newComplaint;
};
