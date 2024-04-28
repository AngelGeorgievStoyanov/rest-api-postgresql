export interface INote {
    _id?: string;
    title: string;
    content: string;
    createdAt?: string;
    editedAt?: string;
    completed?: boolean;
    completedAt?: string;
    _ownerId: string;
  }
  