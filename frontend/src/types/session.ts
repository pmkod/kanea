export interface Session {
  id: string;
  agent: string;
  // Not the true id,

  createdAt: Date;
  isCurrentSession?: boolean;
}
