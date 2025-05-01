
export type ComplaintStatus = 
  | 'pending' 
  | 'in-progress' 
  | 'resolved' 
  | 'rejected';

export type ComplaintCategory = 
  | 'academic' 
  | 'infrastructure' 
  | 'administrative' 
  | 'hostel' 
  | 'canteen' 
  | 'transport' 
  | 'others';

export type UserRole = 'student' | 'admin';

export interface Comment {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: Date;
}

export interface ComplaintUpdate {
  date: string;
  description: string;
  status: ComplaintStatus;
  by: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: 'low' | 'medium' | 'high';
  studentId: string;
  studentName: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  assignedTo?: string;
  resolvedAt?: Date;
  rejectionReason?: string;
  updates?: ComplaintUpdate[];
  imageUrl?: string; // Add support for image attachment
}

export interface ComplaintStatusOption {
  value: ComplaintStatus;
  label: string;
  color: string;
}

export const COMPLAINT_STATUS_OPTIONS: ComplaintStatusOption[] = [
  { 
    value: 'pending', 
    label: 'Pending Review', 
    color: 'bg-yellow-500' 
  },
  { 
    value: 'in-progress', 
    label: 'In Progress', 
    color: 'bg-blue-500' 
  },
  { 
    value: 'resolved', 
    label: 'Resolved', 
    color: 'bg-green-500' 
  },
  { 
    value: 'rejected', 
    label: 'Rejected', 
    color: 'bg-purple-500' // Changed from red to purple
  },
];

export interface ComplaintCategoryOption {
  value: ComplaintCategory;
  label: string;
  description: string;
}

export const COMPLAINT_CATEGORY_OPTIONS: ComplaintCategoryOption[] = [
  {
    value: 'academic',
    label: 'Academic',
    description: 'Issues related to courses, professors, exams, or grading'
  },
  {
    value: 'infrastructure',
    label: 'Infrastructure',
    description: 'Issues with buildings, classrooms, facilities, or equipment'
  },
  {
    value: 'administrative',
    label: 'Administrative',
    description: 'Problems with college administration, registration, or fees'
  },
  {
    value: 'hostel',
    label: 'Hostel',
    description: 'Issues related to campus housing or dormitories'
  },
  {
    value: 'canteen',
    label: 'Canteen/Food',
    description: 'Concerns about food quality, cafeteria services, or pricing'
  },
  {
    value: 'transport',
    label: 'Transport',
    description: 'Problems with college transportation services'
  },
  {
    value: 'others',
    label: 'Others',
    description: 'Any other issues not covered by the categories above'
  }
];
