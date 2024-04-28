export interface INote {
    _id?: string;
    title: string;
    content: string;
    createdAt?: string;
    editedAt?: string;
    complited?: boolean;
    complitedAt?: string;
    _ownerId: string;
  }
  